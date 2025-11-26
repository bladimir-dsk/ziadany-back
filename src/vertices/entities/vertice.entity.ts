import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Sectore } from 'src/sectores/entities/sectore.entity';
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
export class Vertice {
  @PrimaryGeneratedColumn()
  id_vertice: number;

  @Column()
  latitud: string;

  @Column()
  longitud: string;

  @Column()
  orden: number;

  //creamos una columna para el email de referencedcolumn

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Sectore, (s) => s.vertices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_sectore' })
  sectore: Sectore;

  @ManyToOne(() => Zona, (z) => z.vertices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;
}
