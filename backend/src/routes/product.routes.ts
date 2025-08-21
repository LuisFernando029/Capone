import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Products";

const router = Router();
const repo = AppDataSource.getRepository(Product);

// GET all products
router.get("/", async (_, res) => {
  const products = await repo.find();
  res.json(products);
});

// POST create product
router.post("/", async (req, res) => {
  const product = repo.create(req.body);
  await repo.save(product);
  res.status(201).json(product);
});

export default router;
