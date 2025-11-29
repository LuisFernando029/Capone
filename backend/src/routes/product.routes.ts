import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Products";

const router = Router();
const repo = AppDataSource.getRepository(Product);

// GET all products
router.get("/", async (_, res) => {
  try {
    const products = await repo.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produtos", error });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await repo.findOneBy({ id: Number(id) });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar produto", error });
  }
});

// POST create product
router.post("/", async (req, res) => {
  try {
    const product = repo.create(req.body);
    await repo.save(product);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar produto", error });
  }
});

// PATCH update product
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await repo.findOneBy({ id: Number(id) });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    repo.merge(product, req.body);
    const updated = await repo.save(product);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar produto", error });
  }
});

// DELETE remove product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await repo.findOneBy({ id: Number(id) });

    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await repo.remove(product);

    res.json({ message: "Produto removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover produto", error });
  }
});

// PATCH add stock (adicionar estoque)
router.patch("/:id/add-stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantidade inválida" });
    }

    const product = await repo.findOneBy({ id: Number(id) });
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    product.quantity += Number(quantity);
    await repo.save(product);

    res.json({
      message: "Estoque adicionado com sucesso",
      product
    });
  } catch (error) {
    res.status(400).json({ message: "Erro ao adicionar estoque", error });
  }
});

// PATCH remove stock (remover estoque)
router.patch("/:id/remove-stock", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Quantidade inválida" });
    }

    const product = await repo.findOneBy({ id: Number(id) });
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        message: "Quantidade insuficiente em estoque",
        available: product.quantity,
        requested: quantity
      });
    }

    product.quantity -= Number(quantity);
    await repo.save(product);

    res.json({
      message: "Estoque removido com sucesso",
      product
    });
  } catch (error) {
    res.status(400).json({ message: "Erro ao remover estoque", error });
  }
});

export default router;
