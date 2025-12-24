import { PartialType } from '@nestjs/swagger';
import { CreateUbicacionesCamionDto } from './create-ubicaciones_camion.dto';

export class UpdateUbicacionesCamionDto extends PartialType(CreateUbicacionesCamionDto) {}
