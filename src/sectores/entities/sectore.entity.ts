import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { User } from 'src/users/entities/user.entity';
import { Vertice } from 'src/vertices/entities/vertice.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Sectore {
  @PrimaryGeneratedColumn()
  id_sectore: number;

  @Column()
  name_sector: string;

  @Column()
  color_fill: string;

  //creamos una columna para el email de referencedcolumn

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @OneToMany(() => Vertice, (v) => v.sectore)
  vertices: Vertice[];

  @ManyToOne(() => Zona, (zona) => zona.sectore)
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;

  @OneToMany(() => Cliente, (cliente) => cliente.sector)
  clientes: Cliente[];
}
