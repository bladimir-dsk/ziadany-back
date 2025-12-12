import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateHistorialSuscripcionDto {
  @IsNumber()
  @ApiProperty()
  idSuscripcion: number;

  @IsDateString()
  @ApiProperty()
  fechaAnterior: string;

  @ApiProperty()
  @IsDateString()
  fechaNueva: string;

  @ApiProperty()
  @IsString()
  motivo: string;
}
