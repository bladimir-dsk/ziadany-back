import { PartialType } from '@nestjs/swagger';
import { CreateHistorialSuscripcionDto } from './create-historial-suscripcion.dto';

export class UpdateHistorialSuscripcionDto extends PartialType(CreateHistorialSuscripcionDto) {}
