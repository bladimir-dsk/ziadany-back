import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';
import { CreateVertexDto } from 'src/vertices/dto/create-vertex.dto';

export class CreateSectoreDto {
  @ApiProperty()
  @IsString()
  name_sector: string;

  @ApiProperty()
  @IsString()
  color_fill: string;

  @ApiProperty()
  @IsInt()
  id_zona: number;

  @ApiProperty({ type: [CreateVertexDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVertexDto)
  vertices: CreateVertexDto[];
}
