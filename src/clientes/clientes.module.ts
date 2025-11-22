import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { ZonaService } from 'src/zona/zona.service';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { PlanVigenciaService } from 'src/plan-vigencia/plan-vigencia.service';
import { Plan } from 'src/plan/entities/plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Empresa,
      User,
      Estatus,
      Zona,
      PlanVigencia,
      Plan,
    ]),
  ],
  controllers: [ClientesController],
  providers: [ClientesService, ZonaService, PlanVigenciaService],
  exports: [ClientesService],
})
export class ClientesModule {}
