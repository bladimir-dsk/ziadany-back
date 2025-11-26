import { Injectable } from '@nestjs/common';
import { CreateVertexDto } from './dto/create-vertex.dto';
import { UpdateVertexDto } from './dto/update-vertex.dto';

@Injectable()
export class VerticesService {
  create(createVertexDto: CreateVertexDto) {
    return 'This action adds a new vertex';
  }

  findAll() {
    return `This action returns all vertices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vertex`;
  }

  update(id: number, updateVertexDto: UpdateVertexDto) {
    return `This action updates a #${id} vertex`;
  }

  remove(id: number) {
    return `This action removes a #${id} vertex`;
  }
}
