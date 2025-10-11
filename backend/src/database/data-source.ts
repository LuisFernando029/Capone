import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "../entities/Products";
import { Customer } from "../entities/Customer";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { User } from "../entities/User";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // só para dev! em produção usar migrations
  logging: false,
  entities: [Product, Customer, Order, OrderItem, User],
  migrations: [],
  subscribers: [],
});
