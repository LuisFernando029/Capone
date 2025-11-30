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

// GET table by ID (UUID)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id });

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
    const { label, seats, status, tipo, x, y, width, height, lock } = req.body;

    // Validação básica
    if (!label || !seats || x === undefined || y === undefined) {
      return res.status(400).json({ 
        message: "Campos obrigatórios: label, seats, x, y" 
      });
    }

    const table = repo.create({
      label,
      seats: Number(seats),
      status: status || 'available',
      tipo: tipo || 'mesa',
      x: Number(x),
      y: Number(y),
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      lock: lock || false
    });

    await repo.save(table);
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar mesa", error });
  }
});

// PATCH update table (UUID)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    // Atualiza apenas os campos fornecidos
    const { label, seats, status, tipo, x, y, width, height, lock } = req.body;

    if (label !== undefined) table.label = label;
    if (seats !== undefined) table.seats = Number(seats);
    if (status !== undefined) table.status = status;
    if (tipo !== undefined) table.tipo = tipo;
    if (x !== undefined) table.x = Number(x);
    if (y !== undefined) table.y = Number(y);
    if (width !== undefined) table.width = Number(width);
    if (height !== undefined) table.height = Number(height);
    if (lock !== undefined) table.lock = lock;

    const updated = await repo.save(table);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar mesa", error });
  }
});

// DELETE remove table (UUID)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await repo.findOneBy({ id });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    await repo.remove(table);

    res.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover mesa", error });
  }
});

// PATCH update table status (útil para reservas)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['available', 'busy', 'reserved'].includes(status)) {
      return res.status(400).json({ 
        message: "Status inválido. Use: available, busy ou reserved" 
      });
    }

    const table = await repo.findOneBy({ id });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    table.status = status;
    const updated = await repo.save(table);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar status da mesa", error });
  }
});

// PATCH bulk update positions (útil para o canvas)
router.patch("/bulk/positions", async (req, res) => {
  try {
    const { tables } = req.body;

    if (!Array.isArray(tables)) {
      return res.status(400).json({ message: "Formato inválido. Envie um array de tables" });
    }

    const updatedTables = [];

    for (const tableData of tables) {
      const table = await repo.findOneBy({ id: tableData.id });
      
      if (table) {
        if (tableData.x !== undefined) table.x = Number(tableData.x);
        if (tableData.y !== undefined) table.y = Number(tableData.y);
        if (tableData.width !== undefined) table.width = Number(tableData.width);
        if (tableData.height !== undefined) table.height = Number(tableData.height);
        if (tableData.lock !== undefined) table.lock = tableData.lock;
        
        const updated = await repo.save(table);
        updatedTables.push(updated);
      }
    }

    res.json({ 
      message: "Posições atualizadas com sucesso",
      tables: updatedTables 
    });
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar posições", error });
  }
});

export default router;
