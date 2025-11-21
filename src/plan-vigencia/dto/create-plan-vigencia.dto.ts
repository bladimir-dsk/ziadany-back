import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanVigenciaDto {
  @IsString()
  @ApiProperty()
  nombre: string;

  @IsInt()
  @ApiProperty()
  duracion: number;

  @IsInt()
  @ApiProperty()
  precio: number;

  @IsInt()
  @ApiProperty()
  id_plan: number;
}
