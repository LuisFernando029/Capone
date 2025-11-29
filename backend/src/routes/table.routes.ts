import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Table } from "../entities/Table";

const router = Router();
const repo = AppDataSource.getRepository(Table);

// GET all tables
router.get("/", async (_, res) => {
  try {
    const tables = await repo.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar mesas", error });
  }
});

// GET table by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id: Number(id) });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar mesa", error });
  }
});

// POST create table
router.post("/", async (req, res) => {
  try {
    const table = repo.create(req.body);
    await repo.save(table);
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar mesa", error });
  }
});

// PATCH update table
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id: Number(id) });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    repo.merge(table, req.body);
    const updated = await repo.save(table);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar mesa", error });
  }
});

// DELETE remove table
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id: Number(id) });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    await repo.remove(table);

    res.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover mesa", error });
  }
});

export default router;
