import { Module } from '@nestjs/common';
import { VerticesService } from './vertices.service';
import { VerticesController } from './vertices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vertice } from './entities/vertice.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { ZonaService } from 'src/zona/zona.service';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vertice, Sectore, Empresa, User, Zona, Cliente]),
  ],
  controllers: [VerticesController],
  providers: [VerticesService, ZonaService],
  exports: [VerticesService],
})
export class VerticesModule {}
