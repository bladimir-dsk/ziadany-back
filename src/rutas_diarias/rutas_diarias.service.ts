import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRutasDiariaDto } from './dto/create-rutas_diaria.dto';
import { UpdateRutasDiariaDto } from './dto/update-rutas_diaria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Repository } from 'typeorm';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { RutasDiaria } from './entities/rutas_diaria.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class RutasDiariasService {
  constructor(
    @InjectRepository(RutasDiaria)
    private readonly rutasDiariaRepository: Repository<RutasDiaria>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
  ) {}
  async create(
    createRutasDiariaDto: CreateRutasDiariaDto,
    user: UserActiveInterface,
  ) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const empleado = await this.empleadoRepository.findOne({
      where: {
        id_empleado: createRutasDiariaDto.id_empleado,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }
    const zona = await this.zonaRepository.findOne({
      where: {
        id_zona: createRutasDiariaDto.id_zona,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }
    const newRutasDiaria = this.rutasDiariaRepository.create({
      ...createRutasDiariaDto,
      empresa,
      empleado,
      zona,
      userEmail: user.email,
    });
    return await this.rutasDiariaRepository.save(newRutasDiaria);
  }

  async findAll(user: UserActiveInterface) {
    return this.rutasDiariaRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado', 'zona'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const rutasDiaria = await this.rutasDiariaRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado', 'zona'],
    });
    if (!rutasDiaria) {
      throw new BadRequestException('Rutas de diaria no encontrado');
    }
    return rutasDiaria;
  }

  async update(
    id: number,
    updateRutasDiariaDto: UpdateRutasDiariaDto,
    user: UserActiveInterface,
  ) {
    const rutasDiaria = await this.rutasDiariaRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado', 'zona'],
    });
    if (!rutasDiaria) {
      throw new BadRequestException('Rutas de diaria no encontrado');
    }
    const empleado = await this.empleadoRepository.findOne({
      where: {
        id_empleado: updateRutasDiariaDto.id_empleado,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }
    const zona = await this.zonaRepository.findOne({
      where: {
        id_zona: updateRutasDiariaDto.id_zona,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }

    Object.assign(rutasDiaria, updateRutasDiariaDto);
    rutasDiaria.empleado = empleado;
    rutasDiaria.zona = zona;
    return this.rutasDiariaRepository.save(rutasDiaria);
  }

  async remove(id: number, user: UserActiveInterface) {
    const rutasDiaria = await this.rutasDiariaRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!rutasDiaria) {
      throw new BadRequestException('Rutas de diaria no encontrado');
    }
    return await this.rutasDiariaRepository.remove(rutasDiaria);
  }
}
