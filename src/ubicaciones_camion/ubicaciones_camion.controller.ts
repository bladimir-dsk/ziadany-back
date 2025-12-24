import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UbicacionesCamionService } from './ubicaciones_camion.service';
import { CreateUbicacionesCamionDto } from './dto/create-ubicaciones_camion.dto';
import { UpdateUbicacionesCamionDto } from './dto/update-ubicaciones_camion.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('ubicaciones-camion')
export class UbicacionesCamionController {
  constructor(
    private readonly ubicacionesCamionService: UbicacionesCamionService,
  ) {}

  @Post()
  create(
    @Body() createUbicacionesCamionDto: CreateUbicacionesCamionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ubicacionesCamionService.create(
      createUbicacionesCamionDto,
      user,
    );
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.ubicacionesCamionService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.ubicacionesCamionService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUbicacionesCamionDto: UpdateUbicacionesCamionDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.ubicacionesCamionService.update(
      +id,
      updateUbicacionesCamionDto,
      user,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.ubicacionesCamionService.remove(+id, user);
  }
}
