import { Module } from '@nestjs/common';
import { RutasDiariasService } from './rutas_diarias.service';
import { RutasDiariasController } from './rutas_diarias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbicacionesCamion } from 'src/ubicaciones_camion/entities/ubicaciones_camion.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { RutasDiaria } from './entities/rutas_diaria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RutasDiaria,
      UbicacionesCamion,
      Empresa,
      User,
      Empleado,
      Perfil,
      Modulo,
      Estatus,
      Zona,
      Sectore,
      VerticeZona,
      Vertice,
    ]),
  ],
  controllers: [RutasDiariasController],
  providers: [RutasDiariasService],
})
export class RutasDiariasModule {}
