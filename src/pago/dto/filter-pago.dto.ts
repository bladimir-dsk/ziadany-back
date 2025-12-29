// src/pago/dto/filter-pago.dto.ts
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MetodoPago {
  STRIPE = 'stripe',
  EFECTIVO = 'efectivo',
}

export class FilterPagoDto {
  @ApiPropertyOptional({ description: 'Email del usuario que procesó el pago' })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({ description: 'ID del cliente' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_cliente?: number;

  @ApiPropertyOptional({ description: 'Método de pago', enum: MetodoPago })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodo?: MetodoPago;

  @ApiPropertyOptional({ description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({ description: 'Fecha final (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fecha_final?: string;

  @ApiPropertyOptional({ description: 'Monto mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monto_min?: number;

  @ApiPropertyOptional({ description: 'Monto máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monto_max?: number;

  @ApiPropertyOptional({ description: 'ID de suscripción' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id_suscripcion?: number;

  @ApiPropertyOptional({ description: 'Meses pagados' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  meses_pagados?: number;
}
