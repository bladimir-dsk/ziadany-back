import { Module } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EmpresaService } from 'src/empresa/empresa.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';
import { PerfilService } from 'src/perfil/perfil.service';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { EstatusService } from 'src/estatus/estatus.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empleado,
      Empresa,
      User,
      Perfil,
      Modulo,
      Estatus,
    ]),
  ],
  controllers: [EmpleadoController],
  providers: [
    EmpleadoService,
    EmpresaService,
    UsersService,
    PerfilService,
    EstatusService,
  ],
  exports: [EmpleadoService],
})
export class EmpleadoModule {}
