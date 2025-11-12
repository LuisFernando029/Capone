import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Company } from "./Company";

@Entity()
export class Table {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  number!: number;

  @Column({ default: true })
  available!: boolean;

  @ManyToOne(() => Company, (company) => company.tables, {
    onDelete: "CASCADE",
    nullable: true,
  })
  company!: Company;

  @OneToMany(() => Order, (order) => order.table)
  orders!: Order[];
}
