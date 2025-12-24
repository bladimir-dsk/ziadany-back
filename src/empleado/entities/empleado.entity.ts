import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Estatus } from 'src/estatus/entities/estatus.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';
import { RutasDiaria } from 'src/rutas_diarias/entities/rutas_diaria.entity';
import { UbicacionesCamion } from 'src/ubicaciones_camion/entities/ubicaciones_camion.entity';
import { User } from 'src/users/entities/user.entity';
import { Zona } from 'src/zona/entities/zona.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Empleado {
  @PrimaryGeneratedColumn()
  id_empleado: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: false, default: false })
  aplicaEnUsuario: boolean;

  @ManyToOne(() => Empresa, (empresa) => empresa.empleado)
  @JoinColumn({ name: 'id_empresa' })
  empresa: Empresa;

  @Column()
  userEmail: string;

  @Column({ nullable: true })
  role: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'id_usuario' })
  user: User;

  @ManyToOne(() => Perfil, (perfil) => perfil.empleado)
  @JoinColumn({ name: 'id_perfil' })
  perfil: Perfil;

  @ManyToOne(() => Estatus, (estatus) => estatus.empleado)
  @JoinColumn({ name: 'id_estatus' })
  estatus: Estatus;

  @ManyToMany(() => Zona, (zona) => zona.empleados)
  @JoinTable({
    name: 'empleado_zona', // Nombre que tendrá la tabla de unión en la BD
    joinColumn: {
      name: 'id_empleado', // Nombre de la columna que referencia a Empleado
      referencedColumnName: 'id_empleado',
    },
    inverseJoinColumn: {
      name: 'id_zona', // Nombre de la columna que referencia a Zona
      referencedColumnName: 'id_zona',
    },
  })
  zonas: Zona[];

  @OneToMany(
    () => UbicacionesCamion,
    (ubicacionesCamion) => ubicacionesCamion.empleado,
  )
  ubicaciones_camion: UbicacionesCamion[];

  @OneToMany(() => RutasDiaria, (rutasDiaria) => rutasDiaria.empleado)
  rutas_diarias: RutasDiaria[];
}
