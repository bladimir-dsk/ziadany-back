import { PartialType } from '@nestjs/swagger';
import { CreatePuntosRecoleccionDto } from './create-puntos_recoleccion.dto';

export class UpdatePuntosRecoleccionDto extends PartialType(CreatePuntosRecoleccionDto) {}
