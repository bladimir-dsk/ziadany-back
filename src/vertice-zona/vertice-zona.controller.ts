import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VerticeZonaService } from './vertice-zona.service';
import { CreateVerticeZonaDto } from './dto/create-vertice-zona.dto';
import { UpdateVerticeZonaDto } from './dto/update-vertice-zona.dto';

@Controller('vertice-zona')
export class VerticeZonaController {
  constructor(private readonly verticeZonaService: VerticeZonaService) {}

  @Post()
  create(@Body() createVerticeZonaDto: CreateVerticeZonaDto) {
    return this.verticeZonaService.create(createVerticeZonaDto);
  }

  @Get()
  findAll() {
    return this.verticeZonaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verticeZonaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVerticeZonaDto: UpdateVerticeZonaDto) {
    return this.verticeZonaService.update(+id, updateVerticeZonaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verticeZonaService.remove(+id);
  }
}
