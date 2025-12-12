import { PartialType } from '@nestjs/swagger';
import { CreateSuscripcionClienteDto } from './create-suscripcion_cliente.dto';

export class UpdateSuscripcionClienteDto extends PartialType(CreateSuscripcionClienteDto) {}
