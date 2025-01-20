import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./User";
import { Project } from "./Project";

@Entity()
export class Agency {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address!: string;

  @OneToMany(() => User, (user) => user.agency)
  users!: User[];

  @OneToMany(() => Project, (project) => project.agency)
  projects!: Project[];
}
