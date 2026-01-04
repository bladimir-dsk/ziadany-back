import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreatePagoDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  idCliente: number;

  @IsNumber()
  @ApiProperty()
  @IsPositive()
  mesesPagados: number;

  @ApiProperty()
  @IsEnum(['stripe', 'efectivo'], {
    message: 'El método debe ser stripe o efectivo',
  })
  metodo: 'stripe' | 'efectivo';

  @IsOptional()
  @ApiProperty()
  @IsString()
  stripePaymentId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  folio?: string;

  @ApiProperty({
    example: '2026-02-01',
    description: 'Fecha en la que inicia el servicio',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  fechaInicioServicio: string; // 👈 STRING
}
