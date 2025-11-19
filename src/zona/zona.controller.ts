import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ZonaService } from './zona.service';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';

@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('zona')
export class ZonaController {
  constructor(private readonly zonaService: ZonaService) {}

  @Post()
  create(
    @Body() createZonaDto: CreateZonaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.zonaService.create(createZonaDto, user);
  }

  @Get()
  findAll(@ActiveUser() user: UserActiveInterface) {
    return this.zonaService.findAll(user);
  }

  @Get('clientes')
  findAllZonaAndClient(@ActiveUser() user: UserActiveInterface) {
    return this.zonaService.finAllZonaAndClient(user);
  }

  @Get('clientsLength')
  findClientsLength(@ActiveUser() user: UserActiveInterface) {
    return this.zonaService.findClientsLength(user);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.zonaService.findOne(+id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateZonaDto: UpdateZonaDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.zonaService.update(+id, updateZonaDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.zonaService.remove(+id, user);
  }
}
