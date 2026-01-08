import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SuscripcionCliente } from '../suscripcion_cliente/entities/suscripcion_cliente.entity';
import { Pago } from 'src/pago/entities/pago.entity';
import { HistorialSuscripcion } from 'src/historial-suscripcion/entities/historial-suscripcion.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';

@Injectable()
export class SuscripcionesService {
  constructor(
    @InjectRepository(SuscripcionCliente)
    private susRepo: Repository<SuscripcionCliente>,

    @InjectRepository(Pago)
    private pagoRepo: Repository<Pago>,

    @InjectRepository(HistorialSuscripcion)
    private histRepo: Repository<HistorialSuscripcion>,

    @InjectRepository(Cliente)
    private clienteRepo: Repository<Cliente>,

    @InjectRepository(PlanVigencia)
    private vigenciaRepo: Repository<PlanVigencia>,

    @InjectRepository(Empresa) private empRepo: Repository<Empresa>,
  ) {}

  async crearSuscripcion(
    idCliente: number,
    idVigencia: number,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empRepo.findOne({
      where: { id_empresa: user.id_empresa },
    });

    if (!empresa) throw new BadRequestException('Empresa no encontrada');

    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: idCliente },
    });

    const vigencia = await this.vigenciaRepo.findOne({
      where: { id_planVigencia: idVigencia },
    });

    if (!cliente || !vigencia)
      throw new BadRequestException('Cliente o vigencia no encontrada');

    const suscripcionExistente = await this.susRepo.findOne({
      where: { cliente: { id_cliente: idCliente } },
    });

    if (suscripcionExistente) {
      throw new BadRequestException(
        'El cliente ya tiene una suscripción registrada',
      );
    }

    const hoy = new Date();

    const sus = this.susRepo.create({
      cliente,
      planVigencia: vigencia,
      fecha_inicio: hoy,
      fecha_fin: hoy,
      estado: EstadoSuscripcion.PENDIENTE_PAGO,
      userEmail: user.email,
      empresa: { id_empresa: user.id_empresa },
    });

    return this.susRepo.save(sus);
  }

  async actualizarVigencia(
    idCliente: number,
    idNuevaVigencia: number,
    user: UserActiveInterface,
  ) {
    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: idCliente },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const sus = await this.susRepo.findOne({
      where: { cliente: { id_cliente: idCliente } },
      relations: ['planVigencia'],
    });

    if (!sus)
      throw new NotFoundException('El cliente no tiene suscripción activa');

    const nuevaVigencia = await this.vigenciaRepo.findOne({
      where: { id_planVigencia: idNuevaVigencia },
    });

    if (!nuevaVigencia)
      throw new NotFoundException('El nuevo plan de vigencia no existe');

    const hoy = new Date();
    const fechaFinActual = new Date(sus.fecha_fin);

    const diasRestantes = Math.max(
      Math.ceil(
        (fechaFinActual.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      ),
      0,
    );

    const vigenciaAnterior = sus.planVigencia;

    sus.planVigencia = nuevaVigencia;

    await this.susRepo.save(sus);

    return {
      message: 'Vigencia actualizada correctamente',
      vigencia_anterior: vigenciaAnterior.nombre,
      vigencia_nueva: nuevaVigencia.nombre,
      dias_restantes_actuales: diasRestantes,
      nota: 'Los días restantes se conservan. Se sumarán los nuevos días al realizar el siguiente pago.',
    };
  }

  private calcularNuevaFecha(fechaActual: Date, dias: number): Date {
    const nueva = new Date(fechaActual);
    nueva.setDate(nueva.getDate() + dias);
    return nueva;
  }

  async generarFolio(user: UserActiveInterface): Promise<string> {
    const ultimoPago = await this.pagoRepo.findOne({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      order: { id_pago: 'DESC' },
    });

    const consecutivo = ultimoPago ? ultimoPago.id_pago + 1 : 1;
    const year = new Date().getFullYear();

    return `PAGO-${year}-${consecutivo.toString().padStart(6, '0')}`;
  }

  async registrarPago(
    idCliente: number,
    mesesPagados: number,
    metodo: 'stripe' | 'efectivo',
    user: UserActiveInterface,
    stripe_payment_id?: string,
    fechaInicioServicio?: Date,
  ) {
    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: idCliente },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const sus = await this.susRepo.findOne({
      where: { cliente: { id_cliente: idCliente } },
      relations: ['planVigencia'],
    });
    if (!sus)
      throw new NotFoundException('El cliente no tiene suscripción asignada');

    if (!fechaInicioServicio)
      throw new BadRequestException(
        'Debe indicar la fecha de inicio del servicio',
      );

    // 🔹 LÓGICA DE COBRANZA MEJORADA
    // La duración de la vigencia representa el periodo (ej: mensual=30, trimestral=90)
    // mesesPagados multiplica ese periodo
    const diasPorPeriodo = sus.planVigencia.duracion;
    const diasAplicados = mesesPagados * diasPorPeriodo;

    // Parsear la fecha manualmente como YYYY-MM-DD
    const fechaString =
      typeof fechaInicioServicio === 'string'
        ? fechaInicioServicio
        : fechaInicioServicio.toISOString().split('T')[0];

    const [year, month, day] = fechaString.split('-').map(Number);
    const fechaInicio = new Date(year, month - 1, day, 0, 0, 0, 0);

    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + diasAplicados - 1);

    const fechaAnterior = sus.fecha_fin;
    const folio = await this.generarFolio(user);

    const hoyNormalizado = new Date();
    hoyNormalizado.setHours(0, 0, 0, 0);

    // 🔹 LÓGICA DE ESTADO SEGÚN FECHA DE INICIO
    let estadoSuscripcion: EstadoSuscripcion;

    if (fechaInicio > hoyNormalizado) {
      // Si la fecha de inicio es futura → PAGADO CON ESPERA
      estadoSuscripcion = EstadoSuscripcion.PAGADO_ESPERA_INICIO;
    } else {
      // Si la fecha de inicio es hoy o pasada → ACTIVA
      estadoSuscripcion = EstadoSuscripcion.ACTIVA;
    }

    // 🔹 Actualizamos suscripción
    sus.fecha_inicio = fechaInicio;
    sus.fecha_fin = fechaFin;
    sus.estado = estadoSuscripcion;

    await this.susRepo.save(sus);

    // 🔹 Guardamos pago
    const pago = this.pagoRepo.create({
      folio,
      cliente,
      suscripcion: sus,
      metodo,
      monto: mesesPagados * sus.planVigencia.precio,
      stripe_payment_id: stripe_payment_id || null,
      meses_pagados: mesesPagados,
      fechaInicioServicio: fechaInicio,
      dias_aplicados: diasAplicados,
      userEmail: user.email,
      empresa: { id_empresa: user.id_empresa },
    });

    await this.pagoRepo.save(pago);

    // 🔹 Historial
    await this.histRepo.save(
      this.histRepo.create({
        suscripcion: sus,
        fecha_anterior: fechaAnterior,
        fecha_nueva: fechaFin,
        motivo: 'pago',
      }),
    );

    // 🔹 Cálculo de meses reales pagados
    const mesesReales = (diasAplicados / diasPorPeriodo).toFixed(1);

    return {
      message: 'Pago registrado correctamente',
      folio,
      estadoSuscripcion: estadoSuscripcion,
      fechaInicioServicio: fechaInicio,
      fechaFinServicio: fechaFin,
      diasAplicados,
      mesesPagados,
      periodoVigencia: sus.planVigencia.nombre,
      diasPorPeriodo,
      mesesRealesCalculados: mesesReales,
      montoTotal: pago.monto,
      nota:
        fechaInicio > hoyNormalizado
          ? 'El servicio iniciará en la fecha programada. El estado cambiará automáticamente a ACTIVA cuando llegue la fecha de inicio.'
          : 'El servicio está activo desde hoy.',
    };
  }

  /**
   * 🔹 FUNCIÓN AUTOMÁTICA DE ACTUALIZACIÓN DE ESTADOS
   * Se ejecuta antes de devolver el resumen de clientes
   */
  private async actualizarEstadosSuscripciones(
    user: UserActiveInterface,
  ): Promise<void> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche

    // Obtener todas las suscripciones de la empresa
    const suscripciones = await this.susRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });

    const actualizaciones: Promise<any>[] = [];

    for (const sus of suscripciones) {
      const fechaFin = new Date(sus.fecha_fin);
      fechaFin.setHours(0, 0, 0, 0);

      const diasRestantes = Math.ceil(
        (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );

      let nuevoEstado: EstadoSuscripcion | null = null;

      // 🔹 LÓGICA DE ESTADOS AUTOMÁTICOS
      if (sus.estado === EstadoSuscripcion.PENDIENTE_PAGO) {
        // No cambiar si está pendiente de pago
        continue;
      }

      // 🔹 NUEVA LÓGICA: PAGADO_ESPERA_INICIO → ACTIVA
      if (sus.estado === EstadoSuscripcion.PAGADO_ESPERA_INICIO) {
        const fechaInicio = new Date(sus.fecha_inicio);
        fechaInicio.setHours(0, 0, 0, 0);

        if (hoy >= fechaInicio) {
          // Si hoy es igual o posterior a fecha_inicio → ACTIVA
          nuevoEstado = EstadoSuscripcion.ACTIVA;
        } else {
          // Aún no llega la fecha de inicio, mantener estado
          continue;
        }
      }

      // 🔹 LÓGICA PARA SUSCRIPCIONES ACTIVAS
      if (sus.estado === EstadoSuscripcion.ACTIVA) {
        if (diasRestantes === 0) {
          // 🔹 Si fecha_fin === hoy → PENDIENTE_RENOVAR
          nuevoEstado = EstadoSuscripcion.PENDIENTE_RENOVAR;
        }
      }

      // 🔹 LÓGICA PARA SUSCRIPCIONES VENCIDAS
      if (diasRestantes < 0 && Math.abs(diasRestantes) >= 30) {
        // 🔹 Si fecha_fin pasó hace 30+ días → VENCIDA
        nuevoEstado = EstadoSuscripcion.VENCIDA;
      } else if (
        diasRestantes < 0 &&
        Math.abs(diasRestantes) < 30 &&
        sus.estado !== EstadoSuscripcion.PENDIENTE_RENOVAR &&
        sus.estado !== EstadoSuscripcion.PAGADO_ESPERA_INICIO
      ) {
        // 🔹 Si pasó la fecha pero menos de 30 días → PENDIENTE_RENOVAR
        nuevoEstado = EstadoSuscripcion.PENDIENTE_RENOVAR;
      }

      // Actualizar si hay cambio de estado
      if (nuevoEstado && nuevoEstado !== sus.estado) {
        sus.estado = nuevoEstado;
        actualizaciones.push(this.susRepo.save(sus));
      }
    }

    // Ejecutar todas las actualizaciones en paralelo
    if (actualizaciones.length > 0) {
      await Promise.all(actualizaciones);
    }
  }

  async resumenClientesSuscripcion(user: UserActiveInterface) {
    // 🔹 PRIMERO ACTUALIZAMOS TODOS LOS ESTADOS AUTOMÁTICAMENTE
    await this.actualizarEstadosSuscripciones(user);

    const clientes = await this.clienteRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });

    const suscripciones = await this.susRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
      relations: ['cliente', 'planVigencia', 'planVigencia.plan'],
    });

    const pagos = await this.pagoRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
      relations: ['cliente'],
      order: { fecha_pago: 'DESC' },
    });

    const hoy = new Date();

    return clientes.map((cliente) => {
      const sus = suscripciones.find(
        (s) => s.cliente.id_cliente === cliente.id_cliente,
      );

      const pagosCliente = pagos.filter(
        (p) => p.cliente.id_cliente === cliente.id_cliente,
      );

      const ultimoPago = pagosCliente.length ? pagosCliente[0] : null;

      if (!sus) {
        return {
          id_cliente: cliente.id_cliente,
          cliente,
          tieneSuscripcion: false,
          estado: EstadoSuscripcion.SIN_SUSCRIPCION,
          monto_pago: ultimoPago ? ultimoPago.monto : 0,
          meses_pagados: ultimoPago ? ultimoPago.meses_pagados : 0,
          folio_pago: ultimoPago ? ultimoPago.folio : null,
        };
      }

      const fechaFin = new Date(sus.fecha_fin);
      const diasRestantes = Math.ceil(
        (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 🔹 Estado ya actualizado por la función automática
      const estado = sus.estado;

      return {
        id_cliente: cliente.id_cliente,
        cliente,
        tieneSuscripcion: true,
        estado,
        plan: sus.planVigencia.plan?.name,
        vigencia: sus.planVigencia.nombre,
        duracion_dias: sus.planVigencia.duracion,
        precio: sus.planVigencia.precio,
        fecha_inicio: sus.fecha_inicio,
        fecha_fin: fechaFin,
        dias_restantes: diasRestantes,
        monto_pago: ultimoPago ? ultimoPago.monto : 0,
        meses_pagados: ultimoPago ? ultimoPago.meses_pagados : 0,
        folio_pago: ultimoPago ? ultimoPago.folio : null,
      };
    });
  }

  async resumenClientesSuscripcionConFiltros(
    user: UserActiveInterface,
    filters?: {
      zonas?: number[];
      estado?: EstadoSuscripcion;
      mes?: number;
      anio?: number;
    },
  ) {
    // 🔹 PRIMERO ACTUALIZAMOS TODOS LOS ESTADOS AUTOMÁTICAMENTE
    await this.actualizarEstadosSuscripciones(user);

    const hoy = new Date();

    const mesActual = filters?.mes ?? hoy.getMonth() + 1;
    const anioActual = filters?.anio ?? hoy.getFullYear();

    const query = this.clienteRepo
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.zona', 'zona')
      .leftJoinAndSelect('cliente.sector', 'sector')
      .leftJoinAndSelect('zona.sectore', 'sectores')
      .leftJoinAndSelect(
        'cliente.suscripciones',
        'sus',
        'sus.empresa = :empresaId',
        { empresaId: user.id_empresa },
      )
      .leftJoinAndSelect('sus.planVigencia', 'planVigencia')
      .leftJoinAndSelect('planVigencia.plan', 'plan')
      .where('cliente.empresa = :empresaId', {
        empresaId: user.id_empresa,
      });

    query.andWhere('EXTRACT(MONTH FROM sus.fecha_inicio) = :mes', {
      mes: mesActual,
    });
    query.andWhere('EXTRACT(YEAR FROM sus.fecha_inicio) = :anio', {
      anio: anioActual,
    });

    if (filters?.zonas?.length) {
      query.andWhere('zona.id_zona IN (:...zonas)', {
        zonas: filters.zonas,
      });
    }

    const clientes = await query.getMany();

    const pagos = await this.pagoRepo.find({
      where: { cliente: { id_cliente: In(clientes.map((c) => c.id_cliente)) } },
      relations: ['cliente'],
      order: { fecha_pago: 'DESC' },
    });

    return clientes
      .map((cliente) => {
        const sus = cliente.suscripciones?.[0];

        const pagosCliente = pagos.filter(
          (p) => p.cliente.id_cliente === cliente.id_cliente,
        );
        const ultimoPago = pagosCliente.length ? pagosCliente[0] : null;

        if (!sus) {
          const estado = EstadoSuscripcion.SIN_SUSCRIPCION;
          if (filters?.estado && filters.estado !== estado) return null;

          return {
            id_cliente: cliente.id_cliente,
            cliente,
            sector: cliente.sector,
            zona: cliente.zona,
            tieneSuscripcion: false,
            estado,
            monto_pago: ultimoPago ? ultimoPago.monto : 0,
            meses_pagados: ultimoPago ? ultimoPago.meses_pagados : 0,
            folio_pago: ultimoPago ? ultimoPago.folio : null,
          };
        }

        const fechaFin = new Date(sus.fecha_fin);
        const diasRestantes = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        const estado = sus.estado;

        if (filters?.estado && estado !== filters.estado) return null;

        return {
          id_cliente: cliente.id_cliente,
          cliente,
          sector: cliente.sector,
          zona: cliente.zona,
          tieneSuscripcion: true,
          estado,
          plan: sus.planVigencia.plan?.name,
          precio: sus.planVigencia.precio,
          vigencia: sus.planVigencia.nombre,
          duracion_dias: sus.planVigencia.duracion,
          fecha_inicio: sus.fecha_inicio,
          fecha_fin: fechaFin,
          dias_restantes: diasRestantes,
          monto_pago: ultimoPago ? ultimoPago.monto : 0,
          meses_pagados: ultimoPago ? ultimoPago.meses_pagados : 0,
          folio_pago: ultimoPago ? ultimoPago.folio : null,
        };
      })
      .filter(Boolean);
  }

  async finAllSuscripciones(user: UserActiveInterface) {
    const sus = await this.susRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
      relations: ['cliente', 'planVigencia'],
    });

    const finSuscripciones = sus.map((suscripcion) => {
      const fechaFin = new Date(suscripcion.fecha_fin);
      const hoy = new Date();

      return {
        id_suscripcion: suscripcion.id_suscripcion,
        id_cliente: suscripcion.cliente.id_cliente,
        cliente: suscripcion.cliente,
        planVigencia: suscripcion.planVigencia,
        fecha_fin: fechaFin,
        dias_restantes: Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    });

    return finSuscripciones;
  }
}
