import { Module } from '@nestjs/common';
import { SuscripcionesService } from './suscripcion_cliente.service';
import { SuscripcionesController } from './suscripcion_cliente.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuscripcionCliente } from './entities/suscripcion_cliente.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { User } from 'src/users/entities/user.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Pago } from 'src/pago/entities/pago.entity';
import { HistorialSuscripcion } from 'src/historial-suscripcion/entities/historial-suscripcion.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { SuscripcionesCronService } from './suscripciones-cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      SuscripcionCliente,
      Cliente,
      Empresa,
      User,
      Estatus,
      Zona,
      PlanVigencia,
      Plan,
      Vertice,
      Sectore,
      VerticeZona,
      Pago,
      HistorialSuscripcion,
    ]),
  ],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService, SuscripcionesCronService],
  exports: [SuscripcionesService],
})
export class SuscripcionClienteModule {}
