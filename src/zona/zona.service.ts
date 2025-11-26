import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './entities/zona.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';

@Injectable()
export class ZonaService {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Vertice)
    private verticeRepository: Repository<Vertice>,
  ) {}
  async create(createZonaDto: CreateZonaDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const newZona = this.zonaRepository.create({
      ...createZonaDto,
      userEmail: user.email,
      empresa: empresa,
    });
    const savedZona = await this.zonaRepository.save(newZona);

    const verticesToSave = createZonaDto.vertices.map((v) => {
      console.log('VERTEX RECIBIDO:', v);
      return this.verticeRepository.create({
        ...v,
        zona: savedZona,
        empresa: empresa,
      });
    });
    await this.verticeRepository.save(verticesToSave);
    return {
      msg: 'Zona creada correctamente',
      zona: savedZona,
      vertices: verticesToSave,
    };
  }

  async findAll(user: UserActiveInterface) {
    return await this.zonaRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['vertices'],
    });
  }
  async finAllZonaAndClient(user: UserActiveInterface) {
    return await this.zonaRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['cliente', 'vertices'],
    });
  }
  async findClientsLength(user: UserActiveInterface) {
    const zonas = await this.zonaRepository
      .createQueryBuilder('zona')
      .leftJoin('zona.cliente', 'cliente')
      .addSelect('COUNT(cliente.id_cliente)', 'clientes')
      .where('zona.empresa.id_empresa = :id_empresa', {
        id_empresa: user.id_empresa,
      })
      .groupBy('zona.id_zona')
      .getRawMany();

    return zonas;
  }

  async findOne(id: number, user: UserActiveInterface) {
    const zona = await this.zonaRepository.findOne({
      where: { id_zona: id, empresa: { id_empresa: user.id_empresa } },
      relations: ['vertices'],
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }
    return zona;
  }

  async update(
    id: number,
    updateZonaDto: UpdateZonaDto,
    user: UserActiveInterface,
  ) {
    const zona = await this.zonaRepository.findOne({
      where: { id_zona: id, empresa: { id_empresa: user.id_empresa } },
      relations: ['empresa'],
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }
    const { ...zonaData } = updateZonaDto;
    Object.assign(zona, zonaData);
    zona.userEmail = user.email;
    return this.zonaRepository.save(zona);
  }

  async remove(id: number, user: UserActiveInterface) {
    const zona = await this.zonaRepository.findOne({
      where: { id_zona: id, empresa: { id_empresa: user.id_empresa } },
      relations: ['empresa'],
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }
    //validar que la zona no se pueda eliminar si tiene clientes
    const clientes = await this.clienteRepository.find({
      where: { zona: { id_zona: id } },
    });
    if (clientes.length > 0) {
      throw new BadRequestException('Zona con clientes');
    }
    return this.zonaRepository.delete(id);
  }
}
