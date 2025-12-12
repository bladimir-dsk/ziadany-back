import { Injectable } from '@nestjs/common';
import { CreateHistorialSuscripcionDto } from './dto/create-historial-suscripcion.dto';
import { UpdateHistorialSuscripcionDto } from './dto/update-historial-suscripcion.dto';

@Injectable()
export class HistorialSuscripcionService {
  create(createHistorialSuscripcionDto: CreateHistorialSuscripcionDto) {
    return 'This action adds a new historialSuscripcion';
  }

  findAll() {
    return `This action returns all historialSuscripcion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historialSuscripcion`;
  }

  update(id: number, updateHistorialSuscripcionDto: UpdateHistorialSuscripcionDto) {
    return `This action updates a #${id} historialSuscripcion`;
  }

  remove(id: number) {
    return `This action removes a #${id} historialSuscripcion`;
  }
}
