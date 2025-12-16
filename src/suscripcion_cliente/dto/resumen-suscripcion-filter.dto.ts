import { IsArray, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';

export class ResumenSuscripcionFilterDto {
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  zonas?: number[];

  @IsOptional()
  @IsEnum(EstadoSuscripcion)
  estado?: EstadoSuscripcion;
}
