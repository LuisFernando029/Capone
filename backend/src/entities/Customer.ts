import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalSpent!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
