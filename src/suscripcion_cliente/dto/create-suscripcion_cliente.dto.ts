import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateSuscripcionClienteDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  idCliente: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  idVigencia: number;
}
