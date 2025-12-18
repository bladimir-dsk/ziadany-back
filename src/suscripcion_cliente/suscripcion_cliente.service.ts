import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async registrarPago(
    idCliente: number,
    mesesPagados: number,
    metodo: 'stripe' | 'efectivo',
    user: UserActiveInterface,
    stripe_payment_id?: string,
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

    const diasPorMes = sus.planVigencia.duracion;
    const diasAplicados = mesesPagados * diasPorMes;

    const hoy = new Date();

    const fechaBase =
      sus.fecha_fin && new Date(sus.fecha_fin) > hoy
        ? new Date(sus.fecha_fin)
        : hoy;

    const nuevaFecha = this.calcularNuevaFecha(fechaBase, diasAplicados);

    const fechaAnterior = sus.fecha_fin;

    sus.fecha_fin = nuevaFecha;
    sus.estado = EstadoSuscripcion.ACTIVA;
    await this.susRepo.save(sus);

    const pago = this.pagoRepo.create({
      cliente,
      suscripcion: sus,
      metodo,
      monto: mesesPagados * sus.planVigencia.precio,
      stripe_payment_id: stripe_payment_id || null,
      meses_pagados: mesesPagados,
      dias_aplicados: diasAplicados,
      userEmail: user.email,
      empresa: { id_empresa: user.id_empresa },
    });

    await this.pagoRepo.save(pago);

    await this.histRepo.save(
      this.histRepo.create({
        suscripcion: sus,
        fecha_anterior: fechaAnterior,
        fecha_nueva: nuevaFecha,
        motivo: 'pago',
      }),
    );

    return {
      message: 'Pago registrado correctamente',
      nuevaFechaFin: nuevaFecha,
    };
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

  async fechaCorteCliente(idCliente: number) {
    const sus = await this.susRepo.findOne({
      where: { cliente: { id_cliente: idCliente } },
      relations: ['cliente', 'planVigencia'],
    });

    if (!sus) throw new NotFoundException('El cliente no tiene suscripción');

    const fechaFin = new Date(sus.fecha_fin);
    const hoy = new Date();

    return {
      cliente: sus.cliente.name,
      fecha_corte: fechaFin,
      dias_restantes: Math.ceil(
        (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      ),
    };
  }

  async fechaCorte() {
    const sus = await this.susRepo.find({
      relations: ['cliente', 'planVigencia'],
    });

    const fechaCorte = sus.map((suscripcion) => {
      const fechaFin = new Date(suscripcion.fecha_fin);
      const hoy = new Date();

      return {
        id_suscripcion: suscripcion.id_suscripcion,
        id_cliente: suscripcion.cliente.id_cliente,
        cliente: suscripcion.cliente.name,
        fecha_corte: fechaFin,
        dias_restantes: Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    });

    return fechaCorte;
  }

  async resumenClientesSuscripcion(user: UserActiveInterface) {
    const clientes = await this.clienteRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
    });

    const suscripciones = await this.susRepo.find({
      where: { empresa: { id_empresa: user.id_empresa } },
      relations: ['cliente', 'planVigencia', 'planVigencia.plan'],
    });

    const pagos = await this.pagoRepo.find({
      relations: ['cliente'],
    });

    const hoy = new Date();

    return clientes.map((cliente) => {
      const sus = suscripciones.find(
        (s) => s.cliente.id_cliente === cliente.id_cliente,
      );

      if (!sus) {
        return {
          id_cliente: cliente.id_cliente,
          cliente,
          tieneSuscripcion: false,
          estado: EstadoSuscripcion.SIN_SUSCRIPCION,
        };
      }

      const fechaFin = new Date(sus.fecha_fin);
      const diasRestantes = Math.ceil(
        (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
      );

      const tienePago = pagos.some(
        (p) => p.cliente.id_cliente === cliente.id_cliente,
      );

      let estado = EstadoSuscripcion.ACTIVA;

      if (diasRestantes < 0) estado = EstadoSuscripcion.VENCIDA;
      else if (!tienePago) estado = EstadoSuscripcion.PENDIENTE_PAGO;

      return {
        id_cliente: cliente.id_cliente,
        cliente,
        tieneSuscripcion: true,
        estado,
        plan: sus.planVigencia.plan?.name,
        vigencia: sus.planVigencia.nombre,
        duracion_dias: sus.planVigencia.duracion,
        fecha_inicio: sus.fecha_inicio,
        fecha_fin: fechaFin,
        dias_restantes: diasRestantes,
      };
    });
  }

  async resumenClientesSuscripcionConFiltros(
    user: UserActiveInterface,
    filters?: {
      zonas?: number[];
      estado?: EstadoSuscripcion;
    },
  ) {
    const hoy = new Date();

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

    // 🔹 Filtro por múltiples zonas
    if (filters?.zonas?.length) {
      query.andWhere('zona.id_zona IN (:...zonas)', {
        zonas: filters.zonas,
      });
    }

    const clientes = await query.getMany();

    return clientes
      .map((cliente) => {
        const sus = cliente.suscripciones?.[0];

        // 🔸 Cliente sin suscripción
        if (!sus) {
          const estado = EstadoSuscripcion.SIN_SUSCRIPCION;

          if (filters?.estado && filters.estado !== estado) return null;

          return {
            id_cliente: cliente.id_cliente,
            cliente,
            sector: cliente.sector,
            zona: cliente.zona, // incluye sectores
            tieneSuscripcion: false,
            estado,
          };
        }

        const fechaFin = new Date(sus.fecha_fin);
        const diasRestantes = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        // 🔹 Cálculo real del estado
        let estado = EstadoSuscripcion.ACTIVA;

        if (diasRestantes < 0) {
          estado = EstadoSuscripcion.VENCIDA;
        } else if (sus.estado === EstadoSuscripcion.PENDIENTE_PAGO) {
          estado = EstadoSuscripcion.PENDIENTE_PAGO;
        }

        // 🔸 Filtro por estado (si aplica)
        if (filters?.estado && estado !== filters.estado) return null;

        return {
          id_cliente: cliente.id_cliente,
          cliente,
          zona: cliente.zona,
          sector: cliente.sector,
          tieneSuscripcion: true,
          estado,
          plan: sus.planVigencia.plan?.name,
          vigencia: sus.planVigencia.nombre,
          duracion_dias: sus.planVigencia.duracion,
          fecha_inicio: sus.fecha_inicio,
          fecha_fin: fechaFin,
          dias_restantes: diasRestantes,
        };
      })
      .filter(Boolean);
  }
}
