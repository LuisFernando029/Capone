import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { License } from "./License";
import { Customer } from "./Customer";
import { Table } from "./Table";
import { Order } from "./Order";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  cnpj!: string;

  @Column({ nullable: true })
  email?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => License, (license) => license.company)
  licenses!: License[];

  @OneToMany(() => Customer, (customer) => customer.company)
  customers!: Customer[];

  @OneToMany(() => Table, (table) => table.company)
  tables!: Table[];

  @OneToMany(() => Order, (order) => order.company)
  orders!: Order[];
}
