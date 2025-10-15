import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./Order";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  number!: number; // número da mesa

  @Column({ default: true })
  available!: boolean; // mesa livre ou ocupada

  @OneToMany(() => Order, (order) => order.table)
  orders!: Order[];
}
