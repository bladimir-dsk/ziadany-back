import { Module } from '@nestjs/common';
import { VerticeZonaService } from './vertice-zona.service';
import { VerticeZonaController } from './vertice-zona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerticeZona } from './entities/vertice-zona.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VerticeZona,
      Sectore,
      Empresa,
      User,
      Zona,
      Cliente,
    ]),
  ],
  controllers: [VerticeZonaController],
  providers: [VerticeZonaService],
  exports: [VerticeZonaService],
})
export class VerticeZonaModule {}
