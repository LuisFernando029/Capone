import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Customer } from "../entities/Customer";
import { Product } from "../entities/Products";

const router = Router();
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
const customerRepo = AppDataSource.getRepository(Customer);
const productRepo = AppDataSource.getRepository(Product);

// GET all orders
router.get("/", async (_, res) => {
  const orders = await orderRepo.find({ relations: ["customer"] });
  res.json(orders);
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["customer"],
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const items = await orderItemRepo.find({
      where: { order: { id: Number(id) } },
      relations: ["product"],
    });

    res.json({ ...order, items });
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar pedido", error });
  }
});

// POST create order
router.post("/", async (req, res) => {
  try {
    const { customerId, items } = req.body;

    const customer = await customerRepo.findOneBy({ id: customerId });
    if (!customer) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // cria pedido
    const order = orderRepo.create({ customer, total: 0 });
    await orderRepo.save(order);

    let total = 0;

    // cria itens do pedido
    for (const item of items) {
      const product = await productRepo.findOneBy({ id: item.productId });
      if (!product) {
        return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });
      }

      const orderItem = orderItemRepo.create({
        order,
        product,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      total += product.price * item.quantity;
      await orderItemRepo.save(orderItem);
    }

    // atualiza total
    order.total = total;
    await orderRepo.save(order);

    res.status(201).json({ ...order, items });
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar pedido", error });
  }
});

// PATCH update order (status ou itens)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderRepo.findOneBy({ id: Number(id) });
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    if (status) order.status = status;
    await orderRepo.save(order);

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar pedido", error });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOneBy({ id: Number(id) });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    await orderRepo.remove(order);

    res.json({ message: "Pedido removido com sucesso" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao remover pedido", error });
  }
});

export default router;
