import { Module } from '@nestjs/common';
import { PagoService } from './pago.service';
import { PagoController } from './pago.controller';
import { Pago } from './entities/pago.entity';
import { SuscripcionCliente } from 'src/suscripcion_cliente/entities/suscripcion_cliente.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pago,
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
    ]),
  ],
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService],
})
export class PagoModule {}
