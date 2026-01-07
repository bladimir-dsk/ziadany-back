// src/suscripciones/suscripciones-cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual } from 'typeorm';
import { SuscripcionCliente } from './entities/suscripcion_cliente.entity';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';

@Injectable()
export class SuscripcionesCronService {
  private readonly logger = new Logger(SuscripcionesCronService.name);

  constructor(
    @InjectRepository(SuscripcionCliente)
    private susRepo: Repository<SuscripcionCliente>,
  ) {}

  // 🔹 Se ejecuta todos los días a las 00:01 (1 minuto después de medianoche)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async actualizarEstadosSuscripciones() {
    this.logger.log(
      'Iniciando actualización automática de estados de suscripciones...',
    );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Inicio del día

    try {
      // 🔹 1. Actualizar suscripciones VENCIDAS (fecha_fin < hoy)
      const vencidas = await this.susRepo
        .createQueryBuilder()
        .update(SuscripcionCliente)
        .set({ estado: EstadoSuscripcion.VENCIDA })
        .where('fecha_fin < :hoy', { hoy })
        .andWhere('estado != :estadoVencida', {
          estadoVencida: EstadoSuscripcion.VENCIDA,
        })
        .execute();

      this.logger.log(
        `✅ ${vencidas.affected} suscripciones marcadas como VENCIDAS`,
      );

      // 🔹 2. Actualizar suscripciones PENDIENTE_RENOVAR (fecha_fin = hoy)
      const porRenovar = await this.susRepo
        .createQueryBuilder()
        .update(SuscripcionCliente)
        .set({ estado: EstadoSuscripcion.PENDIENTE_RENOVAR })
        .where('DATE(fecha_fin) = DATE(:hoy)', { hoy })
        .andWhere('estado = :estadoActiva', {
          estadoActiva: EstadoSuscripcion.ACTIVA,
        })
        .execute();

      this.logger.log(
        `✅ ${porRenovar.affected} suscripciones marcadas como PENDIENTE_RENOVAR`,
      );

      this.logger.log('✅ Actualización de estados completada exitosamente');
    } catch (error) {
      this.logger.error(
        '❌ Error al actualizar estados de suscripciones:',
        error,
      );
    }
  }

  // 🔹 Método manual para ejecutar cuando quieras (opcional)
  async ejecutarActualizacionManual() {
    this.logger.log('🔧 Ejecutando actualización manual...');
    await this.actualizarEstadosSuscripciones();
  }
}
