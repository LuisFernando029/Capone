import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Table } from "../entities/Table";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

const router = Router();
const tableRepo = AppDataSource.getRepository(Table);
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);

// ========================================
// GET todas as mesas
// ========================================
router.get("/", async (_, res) => {
  try {
    const tables = await tableRepo.find({ relations: ["orders"] });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar mesas", error });
  }
});

// ========================================
// GET mesa por ID
// ========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await tableRepo.findOne({
      where: { id: Number(id) },
      relations: ["orders"],
    });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    res.json(table);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar mesa", error });
  }
});

// ========================================
// GET pedidos de uma mesa (pelo número da mesa)
// Exemplo: GET /tables/4/orders?status=pending
// ========================================
router.get("/:number/orders", async (req, res) => {
  try {
    const { number } = req.params;
    const { status } = req.query; // status opcional

    // busca mesa pelo número
    const table = await tableRepo.findOne({
      where: { number: Number(number) },
    });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    // filtro dinâmico
    const whereClause: any = { table: { id: table.id } };
    if (status) whereClause.status = status;

    // busca pedidos da mesa
    const orders = await orderRepo.find({
      where: whereClause,
      relations: ["customer", "table"],
      order: { createdAt: "DESC" },
    });

    // busca e adiciona os itens de cada pedido
    const results = [];
    for (const order of orders) {
      const items = await orderItemRepo.find({
        where: { order: { id: order.id } },
        relations: ["product"],
      });

      results.push({
        ...order,
        items,
      });
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar pedidos da mesa", error });
  }
});

// ========================================
// POST criar mesa
// ========================================
router.post("/", async (req, res) => {
  try {
    const { number } = req.body;

    const existing = await tableRepo.findOneBy({ number });
    if (existing) {
      return res.status(400).json({ message: "Número da mesa já existe" });
    }

    const table = tableRepo.create({ number, available: true });
    await tableRepo.save(table);

    res.status(201).json(table);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao criar mesa", error });
  }
});

// ========================================
// PATCH atualizar mesa (ex: disponibilidade)
// ========================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const table = await tableRepo.findOneBy({ id: Number(id) });
    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    // mescla os novos dados e salva
    tableRepo.merge(table, updates);
    const updated = await tableRepo.save(table);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao atualizar mesa", error });
  }
});

// ========================================
// DELETE mesa
// ========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const table = await tableRepo.findOneBy({ id: Number(id) });

    if (!table) {
      return res.status(404).json({ message: "Mesa não encontrada" });
    }

    await tableRepo.remove(table);
    res.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao remover mesa", error });
  }
});

export default router;
