import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Role } from 'src/common/enums/rol.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(
    @Body() createPlanDto: CreatePlanDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planService.create(createPlanDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.planService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.planService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePlanDto: UpdatePlanDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.planService.update(+id, updatePlanDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.planService.remove(+id);
  }
}
