import { forwardRef, Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';

import { Modulo } from 'src/modulos/entities/modulo.entity';

import { Empleado } from 'src/empleado/entities/empleado.entity';
import { User } from 'src/users/entities/user.entity';

import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa,
      Modulo,
      Empleado,
      User,
      Estatus,
      Perfil,
    ]),
  ],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
