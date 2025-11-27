import { Injectable } from '@nestjs/common';
import { CreateVerticeZonaDto } from './dto/create-vertice-zona.dto';
import { UpdateVerticeZonaDto } from './dto/update-vertice-zona.dto';

@Injectable()
export class VerticeZonaService {
  create(createVerticeZonaDto: CreateVerticeZonaDto) {
    return 'This action adds a new verticeZona';
  }

  findAll() {
    return `This action returns all verticeZona`;
  }

  findOne(id: number) {
    return `This action returns a #${id} verticeZona`;
  }

  update(id: number, updateVerticeZonaDto: UpdateVerticeZonaDto) {
    return `This action updates a #${id} verticeZona`;
  }

  remove(id: number) {
    return `This action removes a #${id} verticeZona`;
  }
}
