import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Table } from "../entities/Table";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { verifyLicense } from "../middlewares/verifyLicense";

const router = Router();
const tableRepo = AppDataSource.getRepository(Table);
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);

// GET all tables
router.get("/", verifyLicense, async (req, res) => {
  try {
    const company = (req as any).company;
    const tables = await tableRepo.find({ where: { company: { id: company.id } }, relations: ["orders"] });
    res.json(tables);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar mesas", error });
  }
});

// GET table by ID
router.get("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const company = (req as any).company;

    const table = await tableRepo.findOne({
      where: { id: Number(id), company: { id: company.id } },
      relations: ["orders"],
    });

    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    res.json(table);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar mesa", error });
  }
});

// GET orders of a table
router.get("/:number/orders", verifyLicense, async (req, res) => {
  try {
    const { number } = req.params;
    const { status } = req.query;
    const company = (req as any).company;

    const table = await tableRepo.findOne({ where: { number: Number(number), company: { id: company.id } } });
    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    const whereClause: any = { table: { id: table.id }, company: { id: company.id } };
    if (status) whereClause.status = status;

    const orders = await orderRepo.find({
      where: whereClause,
      relations: ["customer", "table"],
      order: { createdAt: "DESC" },
    });

    const results = [];
    for (const order of orders) {
      const items = await orderItemRepo.find({
        where: { order: { id: order.id } },
        relations: ["product"],
      });
      results.push({ ...order, items });
    }

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao buscar pedidos da mesa", error });
  }
});

// POST create table
router.post("/", verifyLicense, async (req, res) => {
  try {
    const { number } = req.body;
    const company = (req as any).company;

    const existing = await tableRepo.findOne({ where: { number, company: { id: company.id } } });
    if (existing) return res.status(400).json({ message: "Número da mesa já existe" });

    const table = tableRepo.create({ number, available: true, company });
    await tableRepo.save(table);

    res.status(201).json(table);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao criar mesa", error });
  }
});

// PATCH update table
router.patch("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const company = (req as any).company;

    const table = await tableRepo.findOne({ where: { id: Number(id), company: { id: company.id } } });
    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    tableRepo.merge(table, updates);
    const updated = await tableRepo.save(table);

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao atualizar mesa", error });
  }
});

// DELETE table
router.delete("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const company = (req as any).company;

    const table = await tableRepo.findOne({ where: { id: Number(id), company: { id: company.id } } });
    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    await tableRepo.remove(table);
    res.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao remover mesa", error });
  }
});

export default router;
