// src/suscripciones/suscripciones-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuscripcionCliente } from '../suscripcion_cliente/entities/suscripcion_cliente.entity';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';

@Injectable()
export class SuscripcionesCronService {
  private readonly logger = new Logger(SuscripcionesCronService.name);

  constructor(
    @InjectRepository(SuscripcionCliente)
    private susRepo: Repository<SuscripcionCliente>,
  ) {}

  /**
   * 🔹 CRON JOB: Se ejecuta todos los días a las 00:01
   * Actualiza automáticamente los estados de todas las suscripciones
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async actualizarEstadosSuscripcionesAutomatico() {
    this.logger.log('🔄 Iniciando actualización automática de estados...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    try {
      // Obtener todas las suscripciones activas o pendientes de renovar
      const suscripciones = await this.susRepo.find({
        where: [
          { estado: EstadoSuscripcion.ACTIVA },
          { estado: EstadoSuscripcion.PENDIENTE_RENOVAR },
          { estado: EstadoSuscripcion.PAGADO_ESPERA_INICIO },
        ],
      });

      let actualizadas = 0;
      const actualizaciones: Promise<any>[] = [];

      for (const sus of suscripciones) {
        const fechaFin = new Date(sus.fecha_fin);
        fechaFin.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil(
          (fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24),
        );

        let nuevoEstado: EstadoSuscripcion | null = null;

        // 🔹 Lógica de estados

        // 🔹 NUEVA LÓGICA: PAGADO_ESPERA_INICIO → ACTIVA
        if (sus.estado === EstadoSuscripcion.PAGADO_ESPERA_INICIO) {
          const fechaInicio = new Date(sus.fecha_inicio);
          fechaInicio.setHours(0, 0, 0, 0);

          if (hoy >= fechaInicio) {
            nuevoEstado = EstadoSuscripcion.ACTIVA;
          }
        }

        // 🔹 LÓGICA PARA SUSCRIPCIONES ACTIVAS
        if (sus.estado === EstadoSuscripcion.ACTIVA) {
          if (diasRestantes === 0) {
            nuevoEstado = EstadoSuscripcion.PENDIENTE_RENOVAR;
          }
        }

        // 🔹 LÓGICA PARA SUSCRIPCIONES VENCIDAS
        if (diasRestantes < 0 && Math.abs(diasRestantes) >= 30) {
          nuevoEstado = EstadoSuscripcion.VENCIDA;
        } else if (
          diasRestantes < 0 &&
          Math.abs(diasRestantes) < 30 &&
          sus.estado !== EstadoSuscripcion.PENDIENTE_RENOVAR &&
          sus.estado !== EstadoSuscripcion.PAGADO_ESPERA_INICIO
        ) {
          nuevoEstado = EstadoSuscripcion.PENDIENTE_RENOVAR;
        }

        if (nuevoEstado && nuevoEstado !== sus.estado) {
          sus.estado = nuevoEstado;
          actualizaciones.push(this.susRepo.save(sus));
          actualizadas++;
        }
      }

      if (actualizaciones.length > 0) {
        await Promise.all(actualizaciones);
      }

      this.logger.log(
        `✅ Actualización completada: ${actualizadas} suscripciones actualizadas`,
      );
    } catch (error) {
      this.logger.error('❌ Error al actualizar estados:', error);
    }
  }

  /**
   * 🔹 OPCIONAL: Notificar suscripciones próximas a vencer (7 días antes)
   * Se ejecuta todos los días a las 09:00
   */
  @Cron('0 9 * * *') // Todos los días a las 9 AM
  async notificarSuscripcionesPorVencer() {
    this.logger.log('🔔 Verificando suscripciones por vencer...');

    const hoy = new Date();
    const dentroSieteDias = new Date();
    dentroSieteDias.setDate(dentroSieteDias.getDate() + 7);

    try {
      const suscripcionesPorVencer = await this.susRepo
        .createQueryBuilder('sus')
        .leftJoinAndSelect('sus.cliente', 'cliente')
        .where('sus.estado = :estado', { estado: EstadoSuscripcion.ACTIVA })
        .andWhere('sus.fecha_fin BETWEEN :hoy AND :siete', {
          hoy: hoy.toISOString().split('T')[0],
          siete: dentroSieteDias.toISOString().split('T')[0],
        })
        .getMany();

      if (suscripcionesPorVencer.length > 0) {
        this.logger.log(
          `⚠️  ${suscripcionesPorVencer.length} suscripciones vencerán en los próximos 7 días`,
        );
        // Aquí puedes implementar envío de emails, notificaciones, etc.
      }
    } catch (error) {
      this.logger.error('❌ Error al verificar suscripciones:', error);
    }
  }
}
