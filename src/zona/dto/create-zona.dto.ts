import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateVerticeZonaDto } from 'src/vertice-zona/dto/create-vertice-zona.dto';
import { CreateVertexDto } from 'src/vertices/dto/create-vertex.dto';

export class CreateZonaDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  color_fill: string;

  @ApiProperty({ type: [CreateVerticeZonaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVerticeZonaDto)
  vertices: CreateVerticeZonaDto[];
}
