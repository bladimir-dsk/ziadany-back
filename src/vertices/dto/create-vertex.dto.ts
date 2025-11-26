import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVertexDto {
  @IsString()
  @ApiProperty()
  latitud: string;

  @IsString()
  @ApiProperty()
  longitud: string;

  @IsInt()
  @ApiProperty()
  orden: number;
}
