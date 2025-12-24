import { Empleado } from 'src/empleado/entities/empleado.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class RutasDiaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time' })
  hora_inicio: Date;

  @Column({ type: 'time' })
  hora_fin: Date;

  @Column({ type: 'float' })
  distancia_recorrida: number;

  @Column()
  puntos_completados: number;

  @Column()
  estado: string;

  @ManyToOne(() => Empleado, (empleado) => empleado.rutas_diarias)
  empleado: Empleado;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.empleado)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Zona, (zona) => zona.rutas_diarias)
  zona: Zona;
}
