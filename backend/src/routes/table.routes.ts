import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Table } from "../entities/Table";

const router = Router();
const repo = AppDataSource.getRepository(Table);

// GET todas as mesas
router.get("/", async (_, res) => {
  const tables = await repo.find({ relations: ["orders"] });
  res.json(tables);
});

// GET mesa por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOne({
      where: { id: Number(id) },
      relations: ["orders"],
    });

    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });
    res.json(table);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar mesa", error });
  }
});

// POST criar mesa
router.post("/", async (req, res) => {
  try {
    const { number } = req.body;

    const existing = await repo.findOneBy({ number });
    if (existing) {
      return res.status(400).json({ message: "Número da mesa já existe" });
    }

    const table = repo.create({ number, available: true });
    await repo.save(table);

    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar mesa", error });
  }
});

// PATCH atualizar mesa (ex: alterar disponibilidade)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id: Number(id) });

    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    repo.merge(table, req.body);
    const updated = await repo.save(table);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar mesa", error });
  }
});

// DELETE mesa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id: Number(id) });

    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    await repo.remove(table);
    res.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao remover mesa", error });
  }
});

export default router;
