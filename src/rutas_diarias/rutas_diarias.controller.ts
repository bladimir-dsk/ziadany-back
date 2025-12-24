import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RutasDiariasService } from './rutas_diarias.service';
import { CreateRutasDiariaDto } from './dto/create-rutas_diaria.dto';
import { UpdateRutasDiariaDto } from './dto/update-rutas_diaria.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('rutas-diarias')
export class RutasDiariasController {
  constructor(private readonly rutasDiariasService: RutasDiariasService) {}

  @Post()
  create(
    @Body() createRutasDiariaDto: CreateRutasDiariaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.rutasDiariasService.create(createRutasDiariaDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.rutasDiariasService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.rutasDiariasService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateRutasDiariaDto: UpdateRutasDiariaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.rutasDiariasService.update(+id, updateRutasDiariaDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.rutasDiariasService.remove(+id, user);
  }
}
