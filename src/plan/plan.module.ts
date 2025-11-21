import { Module } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Estatus, User, Empresa, PlanVigencia]),
  ],
  controllers: [PlanController],
  providers: [PlanService],
  exports: [PlanService],
})
export class PlanModule {}
