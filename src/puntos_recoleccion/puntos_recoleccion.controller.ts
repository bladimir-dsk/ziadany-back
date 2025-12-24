import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PuntosRecoleccionService } from './puntos_recoleccion.service';
import { CreatePuntosRecoleccionDto } from './dto/create-puntos_recoleccion.dto';
import { UpdatePuntosRecoleccionDto } from './dto/update-puntos_recoleccion.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('puntos-recoleccion')
export class PuntosRecoleccionController {
  constructor(
    private readonly puntosRecoleccionService: PuntosRecoleccionService,
  ) {}

  @Post()
  create(
    @Body() createPuntosRecoleccionDto: CreatePuntosRecoleccionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.puntosRecoleccionService.create(
      createPuntosRecoleccionDto,
      user,
    );
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.puntosRecoleccionService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.puntosRecoleccionService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updatePuntosRecoleccionDto: UpdatePuntosRecoleccionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.puntosRecoleccionService.update(
      +id,
      updatePuntosRecoleccionDto,
      user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.puntosRecoleccionService.remove(+id, user);
  }
}
