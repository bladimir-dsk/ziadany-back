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
import { Sectore } from 'src/sectores/entities/sectore.entity';

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
    @InjectRepository(Sectore)
    private readonly sectorRepository: Repository<Sectore>,
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
    const sector = await this.sectorRepository.findOne({
      where: {
        id_sectore: createClienteDto.id_sector,
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
    });
    if (!sector) {
      throw new BadRequestException('Sector no encontrado');
    }
    const newCliente = this.clienteRepository.create({
      ...createClienteDto,
      zona: zona,
      estatus: estatus,
      planVigencia: planVigencia,
      sector: sector,
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
      relations: [
        'zona',
        'estatus',
        'planVigencia',
        'sector',
        'planVigencia.plan',
      ],
    });
  }

  findEmpleadoMaps(user: UserActiveInterface) {
    return this.clienteRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: [
        'estatus',
        'planVigencia',
        'sector',
        'sector.vertices',
        'sector.zona',
        'sector.zona.vertices',
      ],
    });
  }

  async findZonasConSectoresYClientes(user: UserActiveInterface) {
    const zonas = await this.zonaRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['vertices'],
    });

    const sectores = await this.sectorRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['zona', 'vertices'],
    });

    const clientes = await this.clienteRepository.find({
      where: {
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['zona', 'sector', 'estatus', 'planVigencia'],
    });

    const zonasConDatos = zonas.map((zona) => {
      const sectoresDeZona = sectores.filter(
        (sector) => sector.zona?.id_zona === zona.id_zona,
      );

      const sectoresConClientes = sectoresDeZona.map((sector) => {
        const clientesDelSector = clientes.filter(
          (cliente) => cliente.sector?.id_sectore === sector.id_sectore,
        );

        return {
          id_sectore: sector.id_sectore,
          nombre: sector.name_sector,
          color: sector.color_fill,
          vertices: sector.vertices || [],
          clientes: clientesDelSector.map((cliente) => ({
            id_cliente: cliente.id_cliente,
            nombre: cliente.name,
            apellido: cliente.lastName,
            telefono: cliente.phone,
            email: cliente.email,
            direccion: cliente.address,
            lat: cliente.latitude,
            lng: cliente.longitude,
            estatus: {
              id_estatus: cliente.estatus?.id_estatus,
              nombre: cliente.estatus?.nb_estatus,
              // color: cliente.estatus?.color,
            },
            planVigencia: {
              id_planVigencia: cliente.planVigencia?.id_planVigencia,
              nombre: cliente.planVigencia?.nombre,
            },
          })),
          totalClientes: clientesDelSector.length,
        };
      });

      const clientesSinSector = clientes.filter(
        (cliente) => cliente.zona?.id_zona === zona.id_zona && !cliente.sector,
      );

      return {
        id_zona: zona.id_zona,
        nombre: zona.name,
        color: zona.color_fill,
        vertices: zona.vertices || [],
        sectores: sectoresConClientes,
        clientesSinSector: clientesSinSector.map((cliente) => ({
          id_cliente: cliente.id_cliente,
          nombre: cliente.name,
          apellido: cliente.lastName,
          telefono: cliente.phone,
          email: cliente.email,
          direccion: cliente.address,
          lat: cliente.latitude,
          lng: cliente.longitude,

          estatus: {
            id_estatus: cliente.estatus?.id_estatus,
            nombre: cliente.estatus?.nb_estatus,
            // color: cliente.estatus?.,
          },
          planVigencia: {
            id_planVigencia: cliente.planVigencia?.id_planVigencia,
            nombre: cliente.planVigencia?.nombre,
          },
        })),
        totalSectores: sectoresConClientes.length,
        totalClientes:
          sectoresConClientes.reduce((sum, s) => sum + s.totalClientes, 0) +
          clientesSinSector.length,
      };
    });

    return {
      zonas: zonasConDatos,
      resumen: {
        totalZonas: zonasConDatos.length,
        totalSectores: zonasConDatos.reduce(
          (sum, z) => sum + z.totalSectores,
          0,
        ),
        totalClientes: zonasConDatos.reduce(
          (sum, z) => sum + z.totalClientes,
          0,
        ),
      },
    };
  }

  async findOne(id: number, user: UserActiveInterface) {
    const cliente = await this.clienteRepository.findOne({
      where: {
        id_cliente: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: [
        'zona',
        'estatus',
        'planVigencia',
        'sector',
        'planVigencia.plan',
      ],
    });
    if (!cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
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
        id_cliente: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['zona', 'estatus', 'planVigencia', 'sector'],
    });

    if (!cliente) {
      throw new BadRequestException(
        'Cliente no encontrado o no pertenece a la empresa',
      );
    }

    let zona = cliente.zona;
    if (updateClienteDto.id_zona) {
      zona = await this.zonaRepository.findOne({
        where: {
          id_zona: updateClienteDto.id_zona,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!zona) {
        throw new BadRequestException('Zona no encontrada');
      }
    }

    let estatus = cliente.estatus;
    if (updateClienteDto.id_estatus) {
      estatus = await this.estatusRepository.findOne({
        where: {
          id_estatus: updateClienteDto.id_estatus,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!estatus) {
        throw new BadRequestException('Estatus no encontrado');
      }
    }

    let planVigencia = cliente.planVigencia;
    if (updateClienteDto.id_planVigencia) {
      planVigencia = await this.planVigenciaRepository.findOne({
        where: {
          id_planVigencia: updateClienteDto.id_planVigencia,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!planVigencia) {
        throw new BadRequestException('PlanVigencia no encontrado');
      }
    }

    let sector = cliente.sector;
    if (updateClienteDto.id_sector) {
      sector = await this.sectorRepository.findOne({
        where: {
          id_sectore: updateClienteDto.id_sector,
          empresa: { id_empresa: user.id_empresa },
        },
      });

      if (!sector) {
        throw new BadRequestException('Sector no encontrado');
      }
    }

    const updatedCliente = {
      ...cliente,
      ...updateClienteDto,
      zona,
      estatus,
      planVigencia,
      sector,
      userEmail: user.email,
    };

    return await this.clienteRepository.save(updatedCliente);
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
