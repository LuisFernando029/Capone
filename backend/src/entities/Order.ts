import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer";
import { Table } from "./Table";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, (customer) => customer.id, {
    eager: true,
    onDelete: "CASCADE",
  })
  customer!: Customer;

  @ManyToOne(() => Table, (table) => table.orders, {
    eager: true,
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "tableId" })
  table!: Table;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column({ default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
