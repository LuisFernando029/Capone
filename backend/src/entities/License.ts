import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./Company";

export type LicenseStatus = "active" | "inactive" | "expired";

@Entity()
export class License {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Company, (company) => company.licenses, { onDelete: "CASCADE" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  key!: string;

  @Column({ type: "enum", enum: ["active", "inactive", "expired"], default: "active" })
  status!: LicenseStatus;

  @Column({ type: "date" })
  startDate!: Date;

  @Column({ type: "date" })
  endDate!: Date;

  @Column({ default: 10 })
  maxUsers!: number;

  @Column({ default: 10 })
  maxTables!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
