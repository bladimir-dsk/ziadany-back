import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Zona } from 'src/zona/entities/zona.entity';

@Entity()
export class VerticeZona {
  @PrimaryGeneratedColumn()
  id_verticeZona: number;

  @Column()
  latitud: string;

  @Column()
  longitud: string;

  @Column()
  orden: number;

  @ManyToOne(() => Empresa, (empresa) => empresa.id_empresa)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @ManyToOne(() => Zona, (z) => z.vertices)
  @JoinColumn({ name: 'id_zona' })
  zona: Zona;
}
