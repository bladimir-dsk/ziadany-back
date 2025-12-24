import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsLatitude,
  IsLongitude,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateUbicacionesCamionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  latitud: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  longitud: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  estado: string;

  @IsInt()
  @ApiProperty()
  id_empleado: number;
}
