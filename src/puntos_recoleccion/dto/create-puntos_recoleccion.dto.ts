import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';
export class CreatePuntosRecoleccionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  latitud: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  longitud: string;

  // ⏱️ Fecha + hora inicio
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  timestamp_inicio: string;

  // ⏱️ Fecha + hora fin
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  timestamp_fin: string;

  // 🏷️ Tipo de parada (CARGA, DESCANSO, ENTREGA, etc.)
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  tipo: string;

  // 📝 Notas opcionales
  @IsString()
  @IsNotEmpty()
  notas: string;

  @IsInt()
  @ApiProperty()
  id_cliente: number;
}
