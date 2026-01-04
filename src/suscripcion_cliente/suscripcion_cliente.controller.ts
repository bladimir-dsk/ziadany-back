// src/suscripciones/suscripciones.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { SuscripcionesService } from './suscripcion_cliente.service';
import { CreateSuscripcionClienteDto } from './dto/create-suscripcion_cliente.dto';
import { CreatePagoDto } from 'src/pago/dto/create-pago.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResumenSuscripcionFilterDto } from './dto/resumen-suscripcion-filter.dto';
@ApiBearerAuth('jwt')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private service: SuscripcionesService) {}

  @Get('resumen-clientes')
  resumenClientes(@ActiveUser() user: UserActiveInterface) {
    return this.service.resumenClientesSuscripcion(user);
  }

  @Get('resumen-filtros')
  resumen(
    @ActiveUser() user: UserActiveInterface,
    @Query() filters: ResumenSuscripcionFilterDto,
  ) {
    return this.service.resumenClientesSuscripcionConFiltros(user, filters);
  }

  @Get()
  finAllSuscripciones(@ActiveUser() user: UserActiveInterface) {
    return this.service.finAllSuscripciones(user);
  }

  @Post('crear')
  crearSuscripcion(
    @Body() dto: CreateSuscripcionClienteDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.service.crearSuscripcion(dto.idCliente, dto.idVigencia, user);
  }

  @Patch('cambiar-vigencia/:idCliente/:idVigencia')
  actualizarVigencia(
    @Param('idCliente') idCliente: number,
    @Param('idVigencia') idNuevaVigencia: number,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.service.actualizarVigencia(idCliente, idNuevaVigencia, user);
  }

  @Post('pago')
  registrarPago(
    @Body() dto: CreatePagoDto,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return this.service.registrarPago(
      dto.idCliente,
      dto.mesesPagados,
      dto.metodo as 'stripe' | 'efectivo',
      user,
      dto.stripePaymentId,
      new Date(dto.fechaInicioServicio), // Convert string to Date object
    );
  }
}
