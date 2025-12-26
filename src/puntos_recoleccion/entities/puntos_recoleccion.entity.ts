import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class PuntosRecoleccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latitud: string;

  @Column()
  longitud: string;

  @Column()
  timestamp_inicio: Date;

  @Column()
  timestamp_fin: Date;

  @Column()
  tipo: string;

  @Column({ nullable: true })
  notas: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.puntos_recoleccion)
  cliente: Cliente;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.empleado)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;
}
