import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PlanVigencia {
  @PrimaryGeneratedColumn()
  id_planVigencia: number;

  @Column({ nullable: false })
  nombre: string;

  @Column()
  duracion: number;

  @Column({ type: 'float' })
  precio: number;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Plan, (plan) => plan.id_plan)
  @JoinColumn({ name: 'id_plan' })
  plan: Plan;
}
