import { Module } from '@nestjs/common';
import { UbicacionesCamionService } from './ubicaciones_camion.service';
import { UbicacionesCamionController } from './ubicaciones_camion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UbicacionesCamion } from './entities/ubicaciones_camion.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { Modulo } from 'src/modulos/entities/modulo.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { RutasDiaria } from 'src/rutas_diarias/entities/rutas_diaria.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      RutasDiaria,
    ]),
  ],
  controllers: [UbicacionesCamionController],
  providers: [UbicacionesCamionService],
  exports: [UbicacionesCamionService],
})
export class UbicacionesCamionModule {}
