import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entities/plan.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Estatus)
    private readonly estatusRepository: Repository<Estatus>,
    @InjectRepository(PlanVigencia)
    private readonly planVigenciaRepository: Repository<PlanVigencia>,
  ) {}
  async create(createPlanDto: CreatePlanDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const estatus = await this.estatusRepository.findOne({
      where: {
        id_estatus: createPlanDto.id_estatus,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!estatus) {
      throw new BadRequestException('Estatus no encontrado');
    }
    const newPlan = this.planRepository.create({
      ...createPlanDto,
      empresa,
      estatus,
      userEmail: user.email,
    });
    return this.planRepository.save(newPlan);
  }

  async findAll(user: UserActiveInterface) {
    return this.planRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['estatus', 'planVigencia'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const plan = await this.planRepository.findOne({
      where: {
        id_plan: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['estatus', 'planVigencia'],
    });
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }
    return plan;
  }

  async update(
    id: number,
    updatePlanDto: UpdatePlanDto,
    user: UserActiveInterface,
  ) {
    const plan = await this.planRepository.findOne({
      where: {
        id_plan: id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }
    const existingEstatus = await this.estatusRepository.findOne({
      where: {
        id_estatus: updatePlanDto.id_estatus,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (updatePlanDto.id_estatus && !existingEstatus) {
      throw new BadRequestException('Estatus no encontrado');
    }

    Object.assign(plan, updatePlanDto);
    plan.estatus = existingEstatus;
    return this.planRepository.save(plan);
  }

  async remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
