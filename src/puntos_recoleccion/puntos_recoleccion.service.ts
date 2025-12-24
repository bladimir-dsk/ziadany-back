import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePuntosRecoleccionDto } from './dto/create-puntos_recoleccion.dto';
import { UpdatePuntosRecoleccionDto } from './dto/update-puntos_recoleccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PuntosRecoleccion } from './entities/puntos_recoleccion.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class PuntosRecoleccionService {
  constructor(
    @InjectRepository(PuntosRecoleccion)
    private readonly puntosRecoleccionRepository: Repository<PuntosRecoleccion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}
  async create(
    createPuntosRecoleccionDto: CreatePuntosRecoleccionDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const cliente = await this.clienteRepository.findOne({
      where: {
        id_cliente: createPuntosRecoleccionDto.id_cliente,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }
    const newPuntosRecoleccion = this.puntosRecoleccionRepository.create({
      ...createPuntosRecoleccionDto,
      empresa,
      cliente,
      userEmail: user.email,
    });
    return await this.puntosRecoleccionRepository.save(newPuntosRecoleccion);
  }

  async findAll(user: UserActiveInterface) {
    return this.puntosRecoleccionRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const puntosRecoleccion = await this.puntosRecoleccionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!puntosRecoleccion) {
      throw new BadRequestException('Puntos de recolección no encontrado');
    }
    return puntosRecoleccion;
  }

  async update(
    id: number,
    updatePuntosRecoleccionDto: UpdatePuntosRecoleccionDto,
    user: UserActiveInterface,
  ) {
    const puntosRecoleccion = await this.puntosRecoleccionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!puntosRecoleccion) {
      throw new BadRequestException('Puntos de recolección no encontrado');
    }
    const cliente = await this.clienteRepository.findOne({
      where: {
        id_cliente: updatePuntosRecoleccionDto.id_cliente,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }

    Object.assign(puntosRecoleccion, updatePuntosRecoleccionDto);
    puntosRecoleccion.cliente = cliente;
    return this.puntosRecoleccionRepository.save(puntosRecoleccion);
  }

  async remove(id: number, user: UserActiveInterface) {
    const puntosRecoleccion = await this.puntosRecoleccionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!puntosRecoleccion) {
      throw new BadRequestException('Puntos de recolección no encontrado');
    }
    return await this.puntosRecoleccionRepository.remove(puntosRecoleccion);
  }
}
