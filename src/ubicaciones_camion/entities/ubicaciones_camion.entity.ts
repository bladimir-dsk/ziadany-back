import { Empleado } from 'src/empleado/entities/empleado.entity';
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
export class UbicacionesCamion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latitud: string;

  @Column()
  longitud: string;

  @Column({ type: 'timestamp' })
  timestamp: string;

  @Column()
  estado: string;

  @ManyToOne(() => Empleado, (empleado) => empleado.ubicaciones_camion)
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
}
