// src/suscripciones/entities/historial-suscripcion.entity.ts
import { SuscripcionCliente } from 'src/suscripcion_cliente/entities/suscripcion_cliente.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class HistorialSuscripcion {
  @PrimaryGeneratedColumn()
  id_historial: number;

  @ManyToOne(() => SuscripcionCliente)
  @JoinColumn({ name: 'id_suscripcion' })
  suscripcion: SuscripcionCliente;

  @Column({ type: 'date' })
  fecha_anterior: Date;

  @Column({ type: 'date' })
  fecha_nueva: Date;

  @Column()
  motivo: string; // pago | ajuste_admin | etc
}
