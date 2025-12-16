// src/suscripciones/entities/suscripcion-cliente.entity.ts
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { EstadoSuscripcion } from 'src/common/enums/estado-suscripcion.enum';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Pago } from 'src/pago/entities/pago.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { Pago } from './pago.entity';

@Entity()
export class SuscripcionCliente {
  @PrimaryGeneratedColumn()
  id_suscripcion: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.id_cliente)
  @JoinColumn({ name: 'id_cliente' })
  cliente: Cliente;

  @ManyToOne(() => PlanVigencia, (planVigencia) => planVigencia.id_planVigencia)
  @JoinColumn({ name: 'id_planVigencia' })
  planVigencia: PlanVigencia;

  @Column({ type: 'date' })
  fecha_inicio: Date;

  @Column({ type: 'date' })
  fecha_fin: Date;

  @Column({
    type: 'enum',
    enum: EstadoSuscripcion,
    default: EstadoSuscripcion.PENDIENTE_PAGO,
  })
  estado: EstadoSuscripcion;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.zona)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @OneToMany(() => Pago, (pago) => pago.suscripcion)
  pagos: Pago[];
}
