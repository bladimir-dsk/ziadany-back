import { PartialType } from '@nestjs/swagger';
import { CreateVerticeZonaDto } from './create-vertice-zona.dto';

export class UpdateVerticeZonaDto extends PartialType(CreateVerticeZonaDto) {}
