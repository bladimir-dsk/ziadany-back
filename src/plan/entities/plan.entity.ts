import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { PlanVigencia } from 'src/plan-vigencia/entities/plan-vigencia.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id_plan: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Estatus, (estatus) => estatus.id_estatus)
  @JoinColumn({ name: 'id_estatus' })
  estatus: Estatus;

  @OneToMany(() => PlanVigencia, (planVigencia) => planVigencia.plan)
  planVigencia: PlanVigencia[];
}
