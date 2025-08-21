import "reflect-metadata";
import { DataSource } from "typeorm";
import { Product } from "../entities/Products";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD),  // <- força string
  database: process.env.DB_NAME,
  synchronize: true,
  logging: true,
  entities: [Product],
  migrations: [],
  subscribers: [],
});
