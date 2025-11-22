import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    @InjectRepository(Estatus)
    private readonly estatusRepository: Repository<Estatus>,
    @InjectRepository(PlanVigencia)
    private readonly planVigenciaRepository: Repository<PlanVigencia>,
  ) {}
  async create(createClienteDto: CreateClienteDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }

    const zona = await this.zonaRepository.findOne({
      where: {
        id_zona: createClienteDto.id_zona,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }

    const estatus = await this.estatusRepository.findOne({
      where: {
        id_estatus: createClienteDto.id_estatus,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!estatus) {
      throw new BadRequestException('Estatus no encontrado');
    }
    const planVigencia = await this.planVigenciaRepository.findOne({
      where: {
        id_planVigencia: createClienteDto.id_planVigencia,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!planVigencia) {
      throw new BadRequestException('PlanVigencia no encontrado');
    }
    const newCliente = this.clienteRepository.create({
      ...createClienteDto,
      zona: zona,
      estatus: estatus,
      planVigencia: planVigencia,
      userEmail: user.email,
      empresa: empresa,
    });
    return this.clienteRepository.save(newCliente);
  }

  findAll(user: UserActiveInterface) {
    return this.clienteRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['zona', 'estatus', 'planVigencia'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const cliente = await this.clienteRepository.findOne({
      where: {
        id_cliente: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['zona', 'estatus', 'planVigencia'],
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }
    return cliente;
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  async remove(id: number, user: UserActiveInterface) {
    const cliente = await this.clienteRepository.findOne({
      where: {
        id_cliente: id,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }
    return this.clienteRepository.remove(cliente);
  }
}
