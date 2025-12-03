import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { DataSource, In, Repository } from 'typeorm';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/common/enums/rol.enum';
import e from 'express';
import { Zona } from 'src/zona/entities/zona.entity';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Perfil)
    private readonly perfilRepository: Repository<Perfil>,
    @InjectRepository(Estatus)
    private readonly estatusRepository: Repository<Estatus>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createEmpleadoDto: CreateEmpleadoDto,
    user: UserActiveInterface,
  ) {
    let empresa: Empresa;
    if (user.role === Role.SOPORTE) {
      if (!createEmpleadoDto.id_empresa) {
        throw new BadRequestException(
          'El id de la empresa es requerido en el perfil de soporte',
        );
      }
      empresa = await this.empresaRepository.findOne({
        where: { id_empresa: createEmpleadoDto.id_empresa },
      });
    } else {
      empresa = await this.empresaRepository.findOne({
        where: { id_empresa: user.id_empresa },
      });
    }

    if (!empresa) {
      throw new BadRequestException('Empresa no encontrada');
    }
    let perfil;
    if (user.role === Role.SOPORTE) {
      if (!createEmpleadoDto.id_perfil) {
        throw new BadRequestException(
          'El id del perfil es requerido en el perfil de soporte',
        );
      }
      perfil = await this.perfilRepository.findOne({
        where: {
          id_perfil: createEmpleadoDto.id_perfil,
          empresa: { id_empresa: createEmpleadoDto.id_empresa },
        },
      });
    } else {
      perfil = await this.perfilRepository.findOne({
        where: {
          id_perfil: createEmpleadoDto.id_perfil,
          empresa: { id_empresa: user.id_empresa },
        },
      });
    }

    if (!perfil) {
      throw new BadRequestException('El perfil no existe');
    }
    const estatus = await this.estatusRepository.findOneBy({
      id_estatus: createEmpleadoDto.id_estatus,
    });
    if (!estatus) {
      throw new BadRequestException('El estatus no existe');
    }
    let usuario: User | null = null;

    if (!createEmpleadoDto.aplicaEnUsuario && createEmpleadoDto.email) {
      throw new BadRequestException(
        'El campo email no debe ser enviado si "aplicaEnUsuario" es falso',
      );
    }

    if (createEmpleadoDto.aplicaEnUsuario) {
      if (
        !createEmpleadoDto.email ||
        !createEmpleadoDto.nbNombres ||
        !createEmpleadoDto.pwdPassword
      ) {
        throw new BadRequestException(
          'Se requiere email, nombre y contraseña si aplicaEnUsuario es verdadero',
        );
      }

      const usuarioExistente = await this.userRepository.findOneBy({
        email: createEmpleadoDto.email,
      });

      const nombreUsuarioExistente = await this.userRepository.findOneBy({
        nbNombres: createEmpleadoDto.nbNombres,
      });
      if (nombreUsuarioExistente) {
        throw new BadRequestException('Ya existe un usuario con ese nombre');
      }

      if (usuarioExistente) {
        throw new BadRequestException('Ya existe un usuario con ese email');
      }

      const existingEmpleadoEmail = await this.empleadoRepository.findOne({
        where: {
          email: createEmpleadoDto.email,
          empresa: { id_empresa: empresa.id_empresa },
        },
      });

      if (existingEmpleadoEmail) {
        throw new BadRequestException(
          'Ya existe un empleado con ese email para esta empresa',
        );
      }

      const hashedPassword = await bcrypt.hash(
        createEmpleadoDto.pwdPassword,
        10,
      );
      usuario = this.userRepository.create({
        nbNombres: createEmpleadoDto.nbNombres,
        email: createEmpleadoDto.email,
        pwdPassword: hashedPassword,
        empresa,
        role: Role.EMPLEADO,
      });
    }

    if (createEmpleadoDto.email) {
      const existingEmpleadoEmailGlobal = await this.empleadoRepository.findOne(
        {
          where: {
            email: createEmpleadoDto.email,
          },
        },
      );

      if (existingEmpleadoEmailGlobal) {
        throw new BadRequestException('Ya existe un empleado con ese email');
      }
    }

    const existingEmpleadoNombreGlobal = await this.empleadoRepository.findOne({
      where: {
        nombre: createEmpleadoDto.nombre,
      },
    });
    if (existingEmpleadoNombreGlobal) {
      throw new BadRequestException('Ya existe un empleado con ese nombre');
    }

    let zonas: Zona[] = [];

    if (createEmpleadoDto.id_zonas && createEmpleadoDto.id_zonas.length > 0) {
      zonas = await this.zonaRepository.find({
        where: {
          id_zona: In(createEmpleadoDto.id_zonas),
          empresa: { id_empresa: empresa.id_empresa },
        },
      });

      if (zonas.length !== createEmpleadoDto.id_zonas.length) {
        const foundIds = zonas.map((z) => z.id_zona);
        const notFoundIds = createEmpleadoDto.id_zonas.filter(
          (id) => !foundIds.includes(id),
        );

        throw new BadRequestException(
          `Una o más zonas no fueron encontradas o no pertenecen a la empresa: ${notFoundIds.join(', ')}`,
        );
      }

      if (createEmpleadoDto.aplicaEnUsuario && zonas.length === 0) {
        throw new BadRequestException(
          'Es obligatorio asignar al menos una zona cuando aplicaEnUsuario es verdadero.',
        );
      }
    }

    return this.dataSource.transaction(async (manager) => {
      let usuarioGuardado: User | null = null;

      if (usuario) {
        usuarioGuardado = await manager.save(User, usuario);
      }

      const empleado = manager.create(Empleado, {
        ...createEmpleadoDto,
        userEmail: user.email,
        user: usuarioGuardado,
        empresa,
        perfil,
        estatus,
        role: Role.EMPLEADO,
        zonas,
      });

      return await manager.save(Empleado, empleado);
    });
  }

  async findAll(user: UserActiveInterface) {
    return await this.empleadoRepository.find({
      where: { empresa: { id_empresa: user.id_empresa } },
      relations: ['empresa', 'user', 'perfil', 'estatus', 'zonas.vertices'],
    });
  }

  async miUsuario(user: UserActiveInterface) {
    return await this.empleadoRepository.findOne({
      where: {
        user: { email: user.email },
      },
      relations: ['empresa', 'user', 'perfil', 'estatus', 'perfil.modulo'],
    });
  }

  async findOne(id: number, user: UserActiveInterface) {
    const empleado = await this.empleadoRepository.findOne({
      where: {
        id_empleado: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa', 'user', 'perfil', 'estatus', 'zonas.vertices'],
    });

    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }
    return empleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
    user: UserActiveInterface,
  ) {
    const relationsToLoad = ['empresa', 'perfil', 'estatus', 'user', 'zonas'];
    let empleado: Empleado;

    if (user.role === Role.SOPORTE) {
      empleado = await this.empleadoRepository.findOne({
        where: { id_empleado: id },
        relations: relationsToLoad,
      });
    } else {
      empleado = await this.empleadoRepository.findOne({
        where: {
          id_empleado: id,
          empresa: { id_empresa: user.id_empresa },
        },
        relations: relationsToLoad,
      });
    }

    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }

    if (updateEmpleadoDto.id_perfil) {
      const perfil = await this.perfilRepository.findOne({
        where: {
          id_perfil: updateEmpleadoDto.id_perfil,
          empresa: { id_empresa: empleado.empresa.id_empresa },
        },
      });

      if (!perfil) {
        throw new BadRequestException(
          'El perfil no existe o no pertenece a la empresa',
        );
      }
      empleado.perfil = perfil;
    }

    if (updateEmpleadoDto.id_estatus) {
      const estatus = await this.estatusRepository.findOneBy({
        id_estatus: updateEmpleadoDto.id_estatus,
      });

      if (!estatus) {
        throw new BadRequestException('El estatus no existe');
      }
      empleado.estatus = estatus;
    }

    if (updateEmpleadoDto.email) {
      const existingEmpleadoEmailGlobal = await this.empleadoRepository.findOne(
        {
          where: {
            email: updateEmpleadoDto.email,
          },
        },
      );

      if (
        existingEmpleadoEmailGlobal &&
        existingEmpleadoEmailGlobal.id_empleado !== id
      ) {
        throw new BadRequestException('Ya existe un empleado con ese email');
      }
    }

    if (updateEmpleadoDto.nombre) {
      const existingEmpleadoNombreGlobal =
        await this.empleadoRepository.findOne({
          where: {
            nombre: updateEmpleadoDto.nombre,
          },
        });

      if (
        existingEmpleadoNombreGlobal &&
        existingEmpleadoNombreGlobal.id_empleado !== id
      ) {
        throw new BadRequestException('Ya existe un empleado con ese nombre');
      }
    }

    let zonasAAsignar: Zona[] | undefined = undefined;

    if (updateEmpleadoDto.id_zonas !== undefined) {
      const idZonas = updateEmpleadoDto.id_zonas;

      if (idZonas.length === 0) {
        zonasAAsignar = [];
      } else {
        zonasAAsignar = await this.zonaRepository.find({
          where: {
            id_zona: In(idZonas),
            empresa: { id_empresa: empleado.empresa.id_empresa },
          },
        });

        if (zonasAAsignar.length !== idZonas.length) {
          const foundIds = zonasAAsignar.map((z) => z.id_zona);
          const notFoundIds = idZonas.filter((id) => !foundIds.includes(id));

          throw new BadRequestException(
            `Una o más zonas no fueron encontradas o no pertenecen a la empresa: ${notFoundIds.join(', ')}`,
          );
        }

        const aplicaUsuarioActualizado =
          updateEmpleadoDto.aplicaEnUsuario ?? empleado.aplicaEnUsuario;

        if (aplicaUsuarioActualizado && zonasAAsignar.length === 0) {
          throw new BadRequestException(
            'Es obligatorio asignar al menos una zona cuando aplicaEnUsuario es verdadero.',
          );
        }
      }
    }

    return this.dataSource.transaction(async (manager) => {
      if (updateEmpleadoDto.aplicaEnUsuario) {
        if (!empleado.user) {
          if (
            !updateEmpleadoDto.email ||
            !updateEmpleadoDto.pwdPassword ||
            !updateEmpleadoDto.nbNombres
          ) {
            throw new BadRequestException(
              'Para crear el usuario, se requiere email, nombre y contraseña',
            );
          }

          const existingUser = await this.userRepository.findOneBy({
            email: updateEmpleadoDto.email,
          });
          if (existingUser)
            throw new BadRequestException('Ya existe un usuario con ese email');

          const existingUserName = await this.userRepository.findOneBy({
            nbNombres: updateEmpleadoDto.nbNombres,
          });
          if (existingUserName)
            throw new BadRequestException(
              'Ya existe un usuario con ese nombre',
            );

          const hashedPassword = await bcrypt.hash(
            updateEmpleadoDto.pwdPassword,
            10,
          );

          const newUser = manager.create(User, {
            nbNombres: updateEmpleadoDto.nbNombres,
            email: updateEmpleadoDto.email,
            pwdPassword: hashedPassword,
            empresa: empleado.empresa,
            role: Role.EMPLEADO,
          });

          empleado.user = await manager.save(User, newUser);
        } else {
          if (updateEmpleadoDto.pwdPassword) {
            empleado.user.pwdPassword = await bcrypt.hash(
              updateEmpleadoDto.pwdPassword,
              10,
            );
          }

          if (updateEmpleadoDto.nbNombres) {
            const existingUserName = await this.userRepository.findOneBy({
              nbNombres: updateEmpleadoDto.nbNombres,
            });
            if (existingUserName && existingUserName.id !== empleado.user.id) {
              throw new BadRequestException(
                'Ya existe otro usuario con ese nombre',
              );
            }
            empleado.user.nbNombres = updateEmpleadoDto.nbNombres;
          }

          if (updateEmpleadoDto.email) {
            const existingUser = await this.userRepository.findOneBy({
              email: updateEmpleadoDto.email,
            });
            if (existingUser && existingUser.id !== empleado.user.id) {
              throw new BadRequestException(
                'Ya existe otro usuario con ese email',
              );
            }
            empleado.user.email = updateEmpleadoDto.email;
          }

          await manager.save(empleado.user);
        }
      }
      const {
        id_perfil,
        id_estatus,
        aplicaEnUsuario,
        pwdPassword,
        id_zonas,
        ...empleadoData
      } = updateEmpleadoDto;

      Object.assign(empleado, empleadoData);
      empleado.aplicaEnUsuario = aplicaEnUsuario ?? empleado.aplicaEnUsuario;

      if (zonasAAsignar !== undefined) {
        empleado.zonas = zonasAAsignar;
      }

      return await manager.save(empleado);
    });
  }

  async remove(id: number, user: UserActiveInterface) {
    if (user.role === Role.SOPORTE) {
      const empleado = await this.empleadoRepository.findOne({
        where: { id_empleado: id },
        relations: ['empresa', 'user', 'perfil', 'estatus'],
      });

      if (!empleado) {
        throw new BadRequestException('Empleado no encontrado');
      }
      return this.empleadoRepository.remove(empleado);
    }

    const empleado = await this.empleadoRepository.findOne({
      where: {
        id_empleado: id,
        empresa: { id_empresa: user.id_empresa },
      },
      relations: ['empresa', 'user', 'perfil', 'estatus'],
    });

    if (!empleado) {
      throw new BadRequestException('Empleado no encontrado');
    }
    return this.empleadoRepository.remove(empleado);
  }

  ///filtrar si aplica en usuario para la empresa
  async findEmpleadoAplicaUsuario(user: UserActiveInterface) {
    const empleado = await this.empleadoRepository.find({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
        aplicaEnUsuario: true,
      },
      relations: ['empresa', 'user', 'perfil', 'estatus', 'zonas.vertices'],
    });
    return empleado;
  }

  //filtrar si no aplica en usuario para la empresa
  async findEmpleadoNoAplicaUsuario(user: UserActiveInterface) {
    const empleado = await this.empleadoRepository.find({
      where: {
        empresa: {
          id_empresa: user.id_empresa,
        },
        aplicaEnUsuario: false,
      },
      relations: ['empresa', 'user', 'perfil', 'estatus', 'zonas.vertices'],
    });
    return empleado;
  }
}
