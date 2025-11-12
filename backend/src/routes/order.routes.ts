import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Customer } from "../entities/Customer";
import { Product } from "../entities/Products";
import { Table } from "../entities/Table";
import { verifyLicense } from "../middlewares/verifyLicense";

const router = Router();
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
const customerRepo = AppDataSource.getRepository(Customer);
const productRepo = AppDataSource.getRepository(Product);
const tableRepo = AppDataSource.getRepository(Table);

// GET all orders
router.get("/", verifyLicense, async (req, res) => {
  const company = (req as any).company;
  const orders = await orderRepo.find({ where: { company: { id: company.id } }, relations: ["customer", "table"] });
  res.json(orders);
});

// GET order by ID
router.get("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const company = (req as any).company;

    const order = await orderRepo.findOne({ where: { id: Number(id), company: { id: company.id } }, relations: ["customer", "table"] });
    if (!order) return res.status(404).json({ message: "Pedido não encontrado" });

    const items = await orderItemRepo.find({ where: { order: { id: order.id } }, relations: ["product"] });
    res.json({ ...order, items });
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar pedido", error });
  }
});

// POST create order
router.post("/", verifyLicense, async (req, res) => {
  try {
    const { customerId, tableId, items } = req.body;
    const company = (req as any).company;

    const customer = await customerRepo.findOne({ where: { id: customerId, company: { id: company.id } } });
    if (!customer) return res.status(404).json({ message: "Cliente não encontrado" });

    const table = await tableRepo.findOne({ where: { id: tableId, company: { id: company.id } } });
    if (!table) return res.status(404).json({ message: "Mesa não encontrada" });

    table.available = false;
    await tableRepo.save(table);

    const order = orderRepo.create({ customer, table, company, total: 0, status: "pending" });
    await orderRepo.save(order);

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productRepo.findOne({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });

      const orderItem = orderItemRepo.create({ order, product, quantity: item.quantity, unitPrice: product.price });
      total += Number(product.price) * item.quantity;
      await orderItemRepo.save(orderItem);
      orderItems.push(orderItem);
    }

    order.total = total;
    await orderRepo.save(order);

    customer.totalSpent = Number(customer.totalSpent || 0) + total;
    await customerRepo.save(customer);

    const createdOrder = await orderRepo.findOne({ where: { id: order.id }, relations: ["customer", "table"] });
    res.status(201).json({ ...createdOrder, items: orderItems });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao criar pedido", error });
  }
});

// PATCH update order
router.patch("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const company = (req as any).company;

    const order = await orderRepo.findOne({ where: { id: Number(id), company: { id: company.id } }, relations: ["table"] });
    if (!order) return res.status(404).json({ message: "Pedido não encontrado" });

    if (status) {
      order.status = status;
      await orderRepo.save(order);

      if (["completed", "finalizado"].includes(status.toLowerCase()) && order.table) {
        order.table.available = true;
        await tableRepo.save(order.table);
      }
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao atualizar pedido", error });
  }
});

// DELETE order
router.delete("/:id", verifyLicense, async (req, res) => {
  try {
    const { id } = req.params;
    const company = (req as any).company;

    const order = await orderRepo.findOne({ where: { id: Number(id), company: { id: company.id } }, relations: ["table", "customer"] });
    if (!order) return res.status(404).json({ message: "Pedido não encontrado" });

    if (order.table) {
      order.table.available = true;
      await tableRepo.save(order.table);
    }

    if (order.customer) {
      order.customer.totalSpent = Math.max(0, Number(order.customer.totalSpent || 0) - Number(order.total || 0));
      await customerRepo.save(order.customer);
    }

    await orderRepo.remove(order);
    res.json({ message: "Pedido removido com sucesso e mesa liberada" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao remover pedido", error });
  }
});

export default router;
