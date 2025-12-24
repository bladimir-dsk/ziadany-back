import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empleado } from 'src/empleado/entities/empleado.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { RutasDiaria } from 'src/rutas_diarias/entities/rutas_diaria.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
import { User } from 'src/users/entities/user.entity';
import { VerticeZona } from 'src/vertice-zona/entities/vertice-zona.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Zona {
  @PrimaryGeneratedColumn()
  id_zona: number;

  @Column()
  name: string;

  @Column()
  color_fill: string;

  @ManyToOne(() => User, (user) => user.email)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email' })
  user: User;

  //creamos una columna para el email de referencedcolumn
  @Column()
  userEmail: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.zona)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @OneToMany(() => Cliente, (cliente) => cliente.zona)
  cliente: Cliente[];

  @OneToMany(() => Sectore, (sectore) => sectore.zona)
  sectore: Sectore[];

  @OneToMany(() => VerticeZona, (v) => v.zona)
  vertices: VerticeZona[];

  @ManyToMany(() => Empleado, (empleado) => empleado.zonas)
  empleados: Empleado[];

  @OneToMany(() => RutasDiaria, (rutasDiaria) => rutasDiaria.zona)
  rutas_diarias: RutasDiaria[];
}
