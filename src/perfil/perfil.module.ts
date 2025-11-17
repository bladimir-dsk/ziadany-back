import { Module } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';
import { ModulosService } from 'src/modulos/modulos.service';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { EmpresaService } from 'src/empresa/empresa.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, Modulo, Empresa, User])],
  exports: [PerfilService],
  controllers: [PerfilController],
  providers: [PerfilService, ModulosService, EmpresaService],
})
export class PerfilModule {}
