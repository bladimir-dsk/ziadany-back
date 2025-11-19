import { create } from 'domain';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Empresa {
  @PrimaryGeneratedColumn()
  id_empresa: number;

  @Column({ nullable: false, default: 'sin nombre' })
  nombre: string;

  @Column({ nullable: true })
  rfc: string;

  @OneToMany(() => User, (user) => user.empresa)
  users: User[];

  @OneToMany(() => Empleado, (empleado) => empleado.empresa)
  empleado: Empleado[];

  @OneToMany(() => Zona, (zona) => zona.empresa)
  zona: Zona[];

  @CreateDateColumn()
  createdAt: Date;
}
