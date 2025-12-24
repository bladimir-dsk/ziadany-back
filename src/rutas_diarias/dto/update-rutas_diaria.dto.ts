import { PartialType } from '@nestjs/swagger';
import { CreateRutasDiariaDto } from './create-rutas_diaria.dto';

export class UpdateRutasDiariaDto extends PartialType(CreateRutasDiariaDto) {}
