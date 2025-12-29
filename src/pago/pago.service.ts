// src/pago/pago.service.ts
import { Injectable } from '@nestjs/common';

import { FilterPagoDto } from './dto/filter-pago.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pago } from './entities/pago.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PagoService {
  constructor(
    @InjectRepository(Pago) private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  async findAll(user: UserActiveInterface, filters?: FilterPagoDto) {
    const queryBuilder = this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.cliente', 'cliente')
      .leftJoinAndSelect('pago.suscripcion', 'suscripcion')
      .leftJoinAndSelect('pago.user', 'user')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      });

    if (filters) {
      if (filters.userEmail) {
        queryBuilder.andWhere('pago.userEmail = :userEmail', {
          userEmail: filters.userEmail,
        });
      }

      if (filters.id_cliente) {
        queryBuilder.andWhere('pago.cliente.id = :id_cliente', {
          id_cliente: filters.id_cliente,
        });
      }

      if (filters.metodo) {
        queryBuilder.andWhere('pago.metodo = :metodo', {
          metodo: filters.metodo,
        });
      }

      if (filters.id_suscripcion) {
        queryBuilder.andWhere('pago.suscripcion.id = :id_suscripcion', {
          id_suscripcion: filters.id_suscripcion,
        });
      }

      if (filters.meses_pagados) {
        queryBuilder.andWhere('pago.meses_pagados = :meses_pagados', {
          meses_pagados: filters.meses_pagados,
        });
      }

      if (filters.fecha_inicio && filters.fecha_final) {
        queryBuilder.andWhere(
          'pago.fecha_pago BETWEEN :fecha_inicio AND :fecha_final',
          {
            fecha_inicio: filters.fecha_inicio,
            fecha_final: filters.fecha_final,
          },
        );
      } else if (filters.fecha_inicio) {
        queryBuilder.andWhere('pago.fecha_pago >= :fecha_inicio', {
          fecha_inicio: filters.fecha_inicio,
        });
      } else if (filters.fecha_final) {
        queryBuilder.andWhere('pago.fecha_pago <= :fecha_final', {
          fecha_final: filters.fecha_final,
        });
      }

      if (filters.monto_min && filters.monto_max) {
        queryBuilder.andWhere('pago.monto BETWEEN :monto_min AND :monto_max', {
          monto_min: filters.monto_min,
          monto_max: filters.monto_max,
        });
      } else if (filters.monto_min) {
        queryBuilder.andWhere('pago.monto >= :monto_min', {
          monto_min: filters.monto_min,
        });
      } else if (filters.monto_max) {
        queryBuilder.andWhere('pago.monto <= :monto_max', {
          monto_max: filters.monto_max,
        });
      }
    }

    const pagos = await queryBuilder
      .orderBy('pago.fecha_pago', 'DESC')
      .getMany();

    const totalCobrado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const pagosPorMetodo = pagos.reduce((acc, pago) => {
      if (!acc[pago.metodo]) {
        acc[pago.metodo] = { cantidad: 0, total: 0 };
      }
      acc[pago.metodo].cantidad++;
      acc[pago.metodo].total += pago.monto;
      return acc;
    }, {});

    return {
      pagos,
      resumen: {
        cantidad_pagos: pagos.length,
        total_cobrado: totalCobrado,
        promedio_por_pago: pagos.length > 0 ? totalCobrado / pagos.length : 0,
        desglose_por_metodo: pagosPorMetodo,
      },
    };
  }

  async findOne(id: number, user: UserActiveInterface) {
    return await this.pagoRepository.findOne({
      where: {
        id_pago: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['cliente', 'suscripcion', 'user'],
    });
  }

  // Reporte de ingresos totales por día
  async getIngresosPorDia(user: UserActiveInterface, fecha: string) {
    const result = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .addSelect('pago.metodo', 'metodo')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .andWhere('DATE(pago.fecha_pago) = :fecha', { fecha })
      .groupBy('pago.metodo')
      .getRawMany();

    const totalGeneral = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .andWhere('DATE(pago.fecha_pago) = :fecha', { fecha })
      .getRawOne();

    return {
      fecha,
      total_general: parseFloat(totalGeneral.total) || 0,
      cantidad_pagos_total: parseInt(totalGeneral.cantidad_pagos) || 0,
      desglose_por_metodo: result.map((r) => ({
        metodo: r.metodo,
        total: parseFloat(r.total) || 0,
        cantidad_pagos: parseInt(r.cantidad_pagos) || 0,
      })),
    };
  }

  // Reporte de ingresos por usuario (empleado)
  async getIngresosPorUsuario(
    user: UserActiveInterface,
    userEmail?: string,
    fecha_inicio?: string,
    fecha_final?: string,
  ) {
    const queryBuilder = this.pagoRepository
      .createQueryBuilder('pago')
      .select('pago.userEmail', 'userEmail')
      .addSelect('SUM(pago.monto)', 'total')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .addSelect('AVG(pago.monto)', 'promedio')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .groupBy('pago.userEmail');

    if (userEmail) {
      queryBuilder.andWhere('pago.userEmail = :userEmail', { userEmail });
    }

    if (fecha_inicio && fecha_final) {
      queryBuilder.andWhere(
        'pago.fecha_pago BETWEEN :fecha_inicio AND :fecha_final',
        { fecha_inicio, fecha_final },
      );
    } else if (fecha_inicio) {
      queryBuilder.andWhere('pago.fecha_pago >= :fecha_inicio', {
        fecha_inicio,
      });
    } else if (fecha_final) {
      queryBuilder.andWhere('pago.fecha_pago <= :fecha_final', {
        fecha_final,
      });
    }

    const result = await queryBuilder.getRawMany();

    return result.map((r) => ({
      userEmail: r.userEmail,
      total: parseFloat(r.total) || 0,
      cantidad_pagos: parseInt(r.cantidad_pagos) || 0,
      promedio: parseFloat(r.promedio) || 0,
    }));
  }

  // Reporte de ingresos por rango de fechas
  async getIngresosPorRango(
    user: UserActiveInterface,
    fecha_inicio?: string,
    fecha_final?: string,
  ) {
    const queryBuilder = this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .addSelect('AVG(pago.monto)', 'promedio')
      .addSelect('MIN(pago.monto)', 'monto_minimo')
      .addSelect('MAX(pago.monto)', 'monto_maximo')
      .addSelect('pago.metodo', 'metodo')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .groupBy('pago.metodo');

    if (fecha_inicio && fecha_final) {
      queryBuilder.andWhere(
        'pago.fecha_pago BETWEEN :fecha_inicio AND :fecha_final',
        { fecha_inicio, fecha_final },
      );
    } else if (fecha_inicio) {
      queryBuilder.andWhere('pago.fecha_pago >= :fecha_inicio', {
        fecha_inicio,
      });
    } else if (fecha_final) {
      queryBuilder.andWhere('pago.fecha_pago <= :fecha_final', {
        fecha_final,
      });
    }

    const result = await queryBuilder.getRawMany();

    const totalGeneral = await this.pagoRepository
      .createQueryBuilder('pago')
      .select('SUM(pago.monto)', 'total')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .andWhere(
        fecha_inicio && fecha_final
          ? 'pago.fecha_pago BETWEEN :fecha_inicio AND :fecha_final'
          : fecha_inicio
            ? 'pago.fecha_pago >= :fecha_inicio'
            : fecha_final
              ? 'pago.fecha_pago <= :fecha_final'
              : '1=1',
        { fecha_inicio, fecha_final },
      )
      .getRawOne();

    return {
      periodo: {
        fecha_inicio: fecha_inicio || 'inicio',
        fecha_final: fecha_final || 'hoy',
      },
      total_general: parseFloat(totalGeneral.total) || 0,
      cantidad_pagos_total: parseInt(totalGeneral.cantidad_pagos) || 0,
      desglose_por_metodo: result.map((r) => ({
        metodo: r.metodo,
        total: parseFloat(r.total) || 0,
        cantidad_pagos: parseInt(r.cantidad_pagos) || 0,
        promedio: parseFloat(r.promedio) || 0,
        monto_minimo: parseFloat(r.monto_minimo) || 0,
        monto_maximo: parseFloat(r.monto_maximo) || 0,
      })),
    };
  }

  // Reporte de top clientes que más han pagado
  async getTopClientes(
    user: UserActiveInterface,
    limit: number = 10,
    fecha_inicio?: string,
    fecha_final?: string,
  ) {
    const queryBuilder = this.pagoRepository
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.cliente', 'cliente')
      .select('cliente.id', 'id_cliente')
      .addSelect('cliente.nombre', 'nombre_cliente')
      .addSelect('SUM(pago.monto)', 'total_pagado')
      .addSelect('COUNT(pago.id_pago)', 'cantidad_pagos')
      .where('pago.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .groupBy('cliente.id')
      .addGroupBy('cliente.nombre')
      .orderBy('total_pagado', 'DESC')
      .limit(limit);

    if (fecha_inicio && fecha_final) {
      queryBuilder.andWhere(
        'pago.fecha_pago BETWEEN :fecha_inicio AND :fecha_final',
        { fecha_inicio, fecha_final },
      );
    } else if (fecha_inicio) {
      queryBuilder.andWhere('pago.fecha_pago >= :fecha_inicio', {
        fecha_inicio,
      });
    } else if (fecha_final) {
      queryBuilder.andWhere('pago.fecha_pago <= :fecha_final', {
        fecha_final,
      });
    }

    const result = await queryBuilder.getRawMany();

    return result.map((r) => ({
      id_cliente: r.id_cliente,
      nombre_cliente: r.nombre_cliente,
      total_pagado: parseFloat(r.total_pagado) || 0,
      cantidad_pagos: parseInt(r.cantidad_pagos) || 0,
    }));
  }

  // Estadísticas generales
  async getEstadisticas(user: UserActiveInterface) {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    )
      .toISOString()
      .split('T')[0];

    const [estadisticasHoy, estadisticasMes, totalHistorico] =
      await Promise.all([
        this.getIngresosPorDia(user, hoy),
        this.getIngresosPorRango(user, inicioMes, hoy),
        this.getIngresosPorRango(user),
      ]);

    return {
      hoy: estadisticasHoy,
      mes_actual: estadisticasMes,
      total_historico: totalHistorico,
    };
  }
}
