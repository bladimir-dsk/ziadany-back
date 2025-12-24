import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUbicacionesCamionDto } from './dto/create-ubicaciones_camion.dto';
import { UpdateUbicacionesCamionDto } from './dto/update-ubicaciones_camion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UbicacionesCamion } from './entities/ubicaciones_camion.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class UbicacionesCamionService {
  constructor(
    @InjectRepository(UbicacionesCamion)
    private readonly ubicacionesCamionRepository: Repository<UbicacionesCamion>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}
  async create(
    createUbicacionesCamionDto: CreateUbicacionesCamionDto,
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
        id_empleado: createUbicacionesCamionDto.id_empleado,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }
    const newUbicacion = this.ubicacionesCamionRepository.create({
      ...createUbicacionesCamionDto,
      empresa,
      empleado,
      userEmail: user.email,
    });
    return await this.ubicacionesCamionRepository.save(newUbicacion);
  }

  async findAll(user: UserActiveInterface) {
    return this.ubicacionesCamionRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const ubicacionesCamion = await this.ubicacionesCamionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado'],
    });
    if (!ubicacionesCamion) {
      throw new BadRequestException('Ubicaciones de camion no encontrado');
    }
    return ubicacionesCamion;
  }

  async update(
    id: number,
    updateUbicacionesCamionDto: UpdateUbicacionesCamionDto,
    user: UserActiveInterface,
  ) {
    const ubicacionesCamion = await this.ubicacionesCamionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empleado'],
    });
    if (!ubicacionesCamion) {
      throw new BadRequestException('Ubicaciones de camion no encontrado');
    }
    const empleado = await this.empleadoRepository.findOne({
      where: {
        id_empleado: updateUbicacionesCamionDto.id_empleado,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }

    Object.assign(ubicacionesCamion, updateUbicacionesCamionDto);
    ubicacionesCamion.empleado = empleado;
    return this.ubicacionesCamionRepository.save(ubicacionesCamion);
  }

  async remove(id: number, user: UserActiveInterface) {
    const ubicacionesCamion = await this.ubicacionesCamionRepository.findOne({
      where: {
        id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!ubicacionesCamion) {
      throw new BadRequestException('Ubicaciones de camion no encontrado');
    }
    return await this.ubicacionesCamionRepository.remove(ubicacionesCamion);
  }
}
