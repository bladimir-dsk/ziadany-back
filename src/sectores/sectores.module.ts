import { Module } from '@nestjs/common';
import { SectoresService } from './sectores.service';
import { SectoresController } from './sectores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sectore } from './entities/sectore.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { ZonaService } from 'src/zona/zona.service';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { VerticesService } from 'src/vertices/vertices.service';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sectore,
      Vertice,
      Empresa,
      User,
      Zona,
      Cliente,
      VerticeZona,
    ]),
  ],
  controllers: [SectoresController],
  providers: [SectoresService, ZonaService, VerticesService],
  exports: [SectoresService],
})
export class SectoresModule {}
