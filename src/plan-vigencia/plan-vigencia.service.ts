import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePlanVigenciaDto } from './dto/create-plan-vigencia.dto';
import { UpdatePlanVigenciaDto } from './dto/update-plan-vigencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanVigencia } from './entities/plan-vigencia.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PlanVigenciaService {
  constructor(
    @InjectRepository(PlanVigencia)
    private planVigenciaRepository: Repository<PlanVigencia>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}
  async create(
    createPlanVigenciaDto: CreatePlanVigenciaDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const plan = await this.planRepository.findOne({
      where: {
        id_plan: createPlanVigenciaDto.id_plan,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }
    const planVigencia = this.planVigenciaRepository.create({
      ...createPlanVigenciaDto,
      empresa,
      plan,
      userEmail: user.email,
    });
    return await this.planVigenciaRepository.save(planVigencia);
  }

  async findAll(user: UserActiveInterface) {
    return this.planVigenciaRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['plan'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const planVigencia = await this.planVigenciaRepository.findOne({
      where: {
        id_planVigencia: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['plan'],
    });
    if (!planVigencia) {
      throw new BadRequestException('Plan de vigencia no encontrado');
    }
    return planVigencia;
  }

  async update(
    id: number,
    updatePlanVigenciaDto: UpdatePlanVigenciaDto,
    user: UserActiveInterface,
  ) {
    const planVigencia = await this.planVigenciaRepository.findOne({
      where: {
        id_planVigencia: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['plan'],
    });
    if (!planVigencia) {
      throw new BadRequestException('Plan de vigencia no encontrado');
    }

    const plan = await this.planRepository.findOne({
      where: {
        id_plan: updatePlanVigenciaDto.id_plan,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa'],
    });
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }

    Object.assign(planVigencia, updatePlanVigenciaDto);
    planVigencia.plan = plan;
    return this.planVigenciaRepository.save(planVigencia);
  }

  remove(id: number) {
    return `This action removes a #${id} planVigencia`;
  }

  async findByPlan(id_plan: number, user: UserActiveInterface) {
    const plan = await this.planRepository.findOne({
      where: {
        id_plan,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!plan) {
      throw new BadRequestException('Plan no encontrado');
    }
    const planVigencias = await this.planVigenciaRepository.find({
      where: {
        plan: { id_plan },
        empresa: { id_empresa: user.id_empresa },
      },
    });
    return {
      plan: plan.name ?? plan.id_plan,
      planVigencias,
    };
  }
}
