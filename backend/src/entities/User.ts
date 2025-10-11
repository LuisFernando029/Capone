import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  role!: string;

  @Column()
  password!: string; // será armazenada com hash

  @CreateDateColumn()
  createdAt!: Date;
}
