import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Products";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.id, { onDelete: "CASCADE" })
  order!: Order;

  @ManyToOne(() => Product, (product) => product.id, { eager: true })
  product!: Product;

  @Column("int")
  quantity!: number;

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice!: number;
}
