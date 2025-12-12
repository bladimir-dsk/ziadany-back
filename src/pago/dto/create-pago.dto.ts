import { ApiProperty } from '@nestjs/swagger';
import {
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
}
