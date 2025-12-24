import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CreateRutasDiariaDto {
  @IsDateString()
  @ApiProperty()
  @IsOptional()
  fecha?: string;

  // ⏰ Hora inicio (HH:mm:ss o HH:mm)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'hora_inicio debe tener formato HH:mm o HH:mm:ss',
  })
  @IsOptional()
  @ApiProperty()
  hora_inicio?: string;

  // ⏰ Hora fin (HH:mm:ss o HH:mm)
  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'hora_fin debe tener formato HH:mm o HH:mm:ss',
  })
  @ApiProperty()
  hora_fin?: string;

  // 📏 Distancia recorrida (ej: km)
  @IsNumber()
  @Min(0)
  @ApiProperty()
  @IsOptional()
  distancia_recorrida?: number;

  // 📍 Puntos completados
  @IsNumber()
  @Min(0)
  @ApiProperty()
  @IsOptional()
  puntos_completados?: number;

  // 📌 Estado de la ruta
  @IsString()
  @ApiProperty()
  @IsOptional()
  estado?: string;

  @IsInt()
  @ApiProperty()
  @IsOptional()
  id_empleado?: number;

  @IsInt()
  @ApiProperty()
  @IsOptional()
  id_zona?: number;
}
