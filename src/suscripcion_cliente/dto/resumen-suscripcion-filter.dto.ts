import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';

export class ResumenSuscripcionFilterDto {
  // @IsOptional()
  // @IsArray()
  // @Type(() => Number)
  // @IsNumber({}, { each: true })
  // zonas?: number[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map(Number)
      : value.split(',').map((v) => Number(v.trim())),
  )
  zonas?: number[];

  @IsOptional()
  @IsEnum(EstadoSuscripcion)
  estado?: EstadoSuscripcion;
}
