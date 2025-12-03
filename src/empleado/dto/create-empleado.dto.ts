import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateEmpleadoDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  id_empresa?: number;

  @ApiProperty()
  @IsInt()
  id_perfil: number;

  @ApiProperty()
  @IsInt()
  id_estatus: number;

  @ApiProperty()
  @IsBoolean()
  aplicaEnUsuario: boolean;

  @ApiProperty()
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsString()
  nbNombres?: string;

  @ApiProperty()
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsEmail()
  email?: string;

  @ApiProperty()
  @ValidateIf((o) => o.aplicaEnUsuario === true)
  @IsString()
  pwdPassword?: string;

  // 🆕 NUEVA PROPIEDAD PARA LAS ZONAS
  @ApiProperty({ type: [Number], required: false })
  @IsOptional() // Hacemos la asignación opcional en el DTO
  @IsArray()
  @IsInt({ each: true }) // Asegura que cada elemento del array es un entero (el ID de la zona)
  id_zonas?: number[];
}
