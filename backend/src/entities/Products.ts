import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: true })
  isAvailable!: boolean;

  @Column({ type: "int", default: 0 })
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
