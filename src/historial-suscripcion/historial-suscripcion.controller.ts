import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialSuscripcionService } from './historial-suscripcion.service';
import { CreateHistorialSuscripcionDto } from './dto/create-historial-suscripcion.dto';
import { UpdateHistorialSuscripcionDto } from './dto/update-historial-suscripcion.dto';

@Controller('historial-suscripcion')
export class HistorialSuscripcionController {
  constructor(private readonly historialSuscripcionService: HistorialSuscripcionService) {}

  @Post()
  create(@Body() createHistorialSuscripcionDto: CreateHistorialSuscripcionDto) {
    return this.historialSuscripcionService.create(createHistorialSuscripcionDto);
  }

  @Get()
  findAll() {
    return this.historialSuscripcionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialSuscripcionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialSuscripcionDto: UpdateHistorialSuscripcionDto) {
    return this.historialSuscripcionService.update(+id, updateHistorialSuscripcionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialSuscripcionService.remove(+id);
  }
}
