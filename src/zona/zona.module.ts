import { Module } from '@nestjs/common';
import { ZonaService } from './zona.service';
import { ZonaController } from './zona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zona } from './entities/zona.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Zona, Empresa, User, Cliente, Vertice, Sectore]),
  ],
  controllers: [ZonaController],
  providers: [ZonaService],
  exports: [ZonaService],
})
export class ZonaModule {}
