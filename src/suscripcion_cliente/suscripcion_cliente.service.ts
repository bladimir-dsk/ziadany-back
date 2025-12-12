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
    const fechaFin = new Date();
    fechaFin.setDate(hoy.getDate() + vigencia.duracion);

    const sus = this.susRepo.create({
      cliente,
      planVigencia: vigencia,
      fecha_inicio: hoy,
      fecha_fin: fechaFin,
      estado: 'activo',
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
    // Verificar cliente
    const cliente = await this.clienteRepo.findOne({
      where: { id_cliente: idCliente },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    // Verificar suscripción
    const sus = await this.susRepo.findOne({
      where: { cliente: { id_cliente: idCliente } },
      relations: ['planVigencia'],
    });

    if (!sus)
      throw new NotFoundException('El cliente no tiene suscripción activa');

    // Verificar vigencia nueva
    const nuevaVigencia = await this.vigenciaRepo.findOne({
      where: { id_planVigencia: idNuevaVigencia },
    });

    if (!nuevaVigencia)
      throw new NotFoundException('El nuevo plan de vigencia no existe');

    // Guardar datos previos
    const vigenciaAnterior = sus.planVigencia;
    const fechaAnteriorFin = sus.fecha_fin;

    // Calcular nueva fecha_fin (a partir de HOY)
    const hoy = new Date();
    const nuevaFechaFin = new Date();
    nuevaFechaFin.setDate(hoy.getDate() + nuevaVigencia.duracion);

    // Actualizar suscripción
    sus.planVigencia = nuevaVigencia;
    sus.fecha_inicio = hoy;
    sus.fecha_fin = nuevaFechaFin;

    await this.susRepo.save(sus);

    // Guardar historial
    // await this.histRepo.save(
    //   this.histRepo.create({
    //     suscripcion: sus,
    //     fecha_anterior: fechaAnteriorFin,
    //     fecha_nueva: nuevaFechaFin,
    //     motivo: `cambio de vigencia (${vigenciaAnterior.nombre} → ${nuevaVigencia.nombre})`,
    //   }),
    // );

    return {
      message: 'Vigencia actualizada correctamente',
      vigencia_anterior: vigenciaAnterior.nombre,
      vigencia_nueva: nuevaVigencia.nombre,
      nueva_fecha_fin: nuevaFechaFin,
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

    const fechaAnterior = sus.fecha_inicio;
    const nuevaFecha = this.calcularNuevaFecha(fechaAnterior, diasAplicados);

    sus.fecha_inicio = nuevaFecha;
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
}
