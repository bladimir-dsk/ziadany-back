import { Controller, Get, Param, Query } from '@nestjs/common';
import { PagoService } from './pago.service';

import { FilterPagoDto } from './dto/filter-pago.dto';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/common/enums/rol.enum';
import { ApiBasicAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiBasicAuth('jwt')
@ApiTags('Pagos')
@Auth([Role.EMPLEADO, Role.EMPRESA])
@Controller('pago')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los pagos con filtros opcionales' })
  findAll(
    @ActiveUser() user: UserActiveInterface,
    @Query() filters: FilterPagoDto,
  ) {
    return this.pagoService.findAll(user, filters);
  }

  @Get('reportes/dia/:fecha')
  @ApiOperation({ summary: 'Obtener ingresos de un día específico' })
  getIngresosPorDia(
    @ActiveUser() user: UserActiveInterface,
    @Param('fecha') fecha: string,
  ) {
    return this.pagoService.getIngresosPorDia(user, fecha);
  }

  @Get('reportes/usuario')
  @ApiOperation({ summary: 'Obtener ingresos por usuario/empleado' })
  @ApiQuery({ name: 'userEmail', required: false })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_final', required: false })
  getIngresosPorUsuario(
    @ActiveUser() user: UserActiveInterface,
    @Query('userEmail') userEmail?: string,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_final') fecha_final?: string,
  ) {
    return this.pagoService.getIngresosPorUsuario(
      user,
      userEmail,
      fecha_inicio,
      fecha_final,
    );
  }

  @Get('reportes/rango')
  @ApiOperation({ summary: 'Obtener ingresos por rango de fechas' })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_final', required: false })
  getIngresosPorRango(
    @ActiveUser() user: UserActiveInterface,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_final') fecha_final?: string,
  ) {
    return this.pagoService.getIngresosPorRango(
      user,
      fecha_inicio,
      fecha_final,
    );
  }

  @Get('reportes/top-clientes')
  @ApiOperation({ summary: 'Obtener top clientes que más han pagado' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_final', required: false })
  getTopClientes(
    @ActiveUser() user: UserActiveInterface,
    @Query('limit') limit?: number,
    @Query('fecha_inicio') fecha_inicio?: string,
    @Query('fecha_final') fecha_final?: string,
  ) {
    return this.pagoService.getTopClientes(
      user,
      limit || 10,
      fecha_inicio,
      fecha_final,
    );
  }

  @Get('reportes/estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas generales (hoy, mes, histórico)',
  })
  getEstadisticas(@ActiveUser() user: UserActiveInterface) {
    return this.pagoService.getEstadisticas(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago por ID' })
  findOne(@Param('id') id: number, @ActiveUser() user: UserActiveInterface) {
    return this.pagoService.findOne(+id, user);
  }
}
