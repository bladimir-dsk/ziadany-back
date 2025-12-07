import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanVigenciaService } from './plan-vigencia.service';
import { CreatePlanVigenciaDto } from './dto/create-plan-vigencia.dto';
import { UpdatePlanVigenciaDto } from './dto/update-plan-vigencia.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('plan-vigencia')
export class PlanVigenciaController {
  constructor(private readonly planVigenciaService: PlanVigenciaService) {}

  @Post()
  create(
    @Body() createPlanVigenciaDto: CreatePlanVigenciaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planVigenciaService.create(createPlanVigenciaDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.planVigenciaService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.planVigenciaService.findOne(id, user);
  }

  @Get('plan/:id_plan')
  findByPlan(
    @Param('id_plan') id_plan: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planVigenciaService.findByPlan(id_plan, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePlanVigenciaDto: UpdatePlanVigenciaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planVigenciaService.update(id, updatePlanVigenciaDto, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
  //   return this.planVigenciaService.remove(id, );
  // }
}
