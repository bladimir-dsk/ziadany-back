import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VerticesService } from './vertices.service';
import { CreateVertexDto } from './dto/create-vertex.dto';
import { UpdateVertexDto } from './dto/update-vertex.dto';

@Controller('vertices')
export class VerticesController {
  constructor(private readonly verticesService: VerticesService) {}

  @Post()
  create(@Body() createVertexDto: CreateVertexDto) {
    return this.verticesService.create(createVertexDto);
  }

  @Get()
  findAll() {
    return this.verticesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.verticesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVertexDto: UpdateVertexDto) {
    return this.verticesService.update(+id, updateVertexDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.verticesService.remove(+id);
  }
}
