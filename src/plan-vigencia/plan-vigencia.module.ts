import { Module } from '@nestjs/common';
import { PlanVigenciaService } from './plan-vigencia.service';
import { PlanVigenciaController } from './plan-vigencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanVigencia } from './entities/plan-vigencia.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Plan } from 'src/plan/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlanVigencia, User, Empresa, Plan])],
  controllers: [PlanVigenciaController],
  providers: [PlanVigenciaService],
  exports: [PlanVigenciaService],
})
export class PlanVigenciaModule {}
