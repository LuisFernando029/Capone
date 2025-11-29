import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Order } from "./Order";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  number!: number;

  @Column()
  capacity?: number;

  @Column({ default: "available" })
  status!: string;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => Order, (order) => order.table)
  orders!: Order[];
}
