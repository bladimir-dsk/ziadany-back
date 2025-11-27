import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSectoreDto } from './dto/create-sectore.dto';
import { UpdateSectoreDto } from './dto/update-sectore.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sectore } from './entities/sectore.entity';
import { Repository } from 'typeorm';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';

@Injectable()
export class SectoresService {
  constructor(
    @InjectRepository(Sectore)
    private sectoreRepository: Repository<Sectore>,
    @InjectRepository(Zona)
    private zonaRepository: Repository<Zona>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Vertice)
    private verticeRepository: Repository<Vertice>,
  ) {}

  async create(createSectoreDto: CreateSectoreDto, user: UserActiveInterface) {
    const empresa = await this.empresaRepository.findOne({
      where: { id_empresa: user.id_empresa },
    });
    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    const zona = await this.zonaRepository.findOne({
      where: {
        id_zona: createSectoreDto.id_zona,
        empresa: { id_empresa: user.id_empresa },
      },
    });
    if (!zona) {
      throw new BadRequestException('Zona no encontrada');
    }
    const newSectore = this.sectoreRepository.create({
      ...createSectoreDto,
      empresa: empresa,
      zona: zona,
    });
    const savedSectore = await this.sectoreRepository.save(newSectore);

    ///guardar vetices ligados al sector
    const verticesToSave = createSectoreDto.vertices.map((v) => {
      console.log('VERTEX RECIBIDO:', v);
      return this.verticeRepository.create({
        ...v,
        sectore: savedSectore,
        empresa: empresa,
      });
    });
    await this.verticeRepository.save(verticesToSave);

    return {
      msg: 'Sector creado correctamente',
      sector: savedSectore,
      // vertices: verticesToSave,
    };
  }

  async findAll(user: UserActiveInterface) {
    return this.sectoreRepository.find({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
      },
      relations: ['zona', 'vertices', 'zona.vertices'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const sectore = await this.sectoreRepository.findOne({
      where: {
        id_sectore: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['vertices'],
    });
    if (!sectore) {
      throw new BadRequestException('Sector no encontrado');
    }
    return sectore;
  }

  async update(
    id: number,
    updateSectoreDto: UpdateSectoreDto,
    user: UserActiveInterface,
  ) {
    const sectore = await this.sectoreRepository.findOne({
      where: {
        id_sectore: id,
        empresa: { id_empresa: user.id_empresa },
      },
    });

    if (!sectore) {
      throw new BadRequestException('Sector no encontrado');
    }

    if (updateSectoreDto.id_zona) {
      const zona = await this.zonaRepository.findOne({
        where: {
          id_zona: updateSectoreDto.id_zona,
          empresa: { id_empresa: user.id_empresa },
        },
      });
      if (!zona) throw new BadRequestException('Zona no encontrada');
      sectore.zona = zona;
    }

    if (updateSectoreDto.vertices !== undefined) {
      const verticesToDelete = await this.verticeRepository.find({
        where: { sectore: { id_sectore: id } },
      });
      await this.verticeRepository.remove(verticesToDelete);

      const verticesToSave = updateSectoreDto.vertices.map((v) =>
        this.verticeRepository.create({
          ...v,
          sectore: { id_sectore: id },
          empresa: { id_empresa: user.id_empresa },
        }),
      );
      await this.verticeRepository.save(verticesToSave);
    }

    const { vertices, ...sectoreData } = updateSectoreDto;
    Object.assign(sectore, sectoreData);
    const updatedSectore = await this.sectoreRepository.save(sectore);
    return {
      msg: 'Sector actualizado correctamente',
      sector: updatedSectore,
    };
  }

  remove(id: number, user: UserActiveInterface) {
    return `This action removes a #${id} sectore`;
  }
}
