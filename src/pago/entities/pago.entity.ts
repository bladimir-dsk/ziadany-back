// src/suscripciones/entities/pago.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { SuscripcionCliente } from 'src/suscripcion_cliente/entities/suscripcion_cliente.entity';
import { User } from 'src/users/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';

@Entity()
export class Pago {
  @PrimaryGeneratedColumn()
  id_pago: number;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => SuscripcionCliente)
  @JoinColumn({ name: 'id_suscripcion' })
  suscripcion: SuscripcionCliente;

  @Column()
  metodo: string; // "stripe" | "efectivo"

  @Column({ type: 'float' })
  monto: number;

  @Column({ nullable: true })
  stripe_payment_id: string;

  @Column()
  meses_pagados: number;

  @Column()
  dias_aplicados: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_pago: Date;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  // creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.zona)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
