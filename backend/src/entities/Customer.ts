import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Company } from "./Company";

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

  @ManyToOne(() => Company, (company) => company.customers, {
    onDelete: "CASCADE",
    nullable: true,
  })
  company!: Company;

  @CreateDateColumn()
  createdAt!: Date;
}
