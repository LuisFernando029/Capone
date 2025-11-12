import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Customer } from "./Customer";
import { Table } from "./Table";
import { Company } from "./Company";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, { eager: true, onDelete: "CASCADE" })
  customer!: Customer;

  @ManyToOne(() => Table, (table) => table.orders, { eager: true, nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "tableId" })
  table!: Table;

  @ManyToOne(() => Company, (company) => company.orders, { onDelete: "CASCADE", nullable: true })
  company!: Company;

  @Column("decimal", { precision: 10, scale: 2 })
  total!: number;

  @Column({ default: "pending" })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
