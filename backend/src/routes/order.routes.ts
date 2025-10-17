import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Customer } from "../entities/Customer";
import { Product } from "../entities/Products";
import { Table } from "../entities/Table";

const router = Router();
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
const customerRepo = AppDataSource.getRepository(Customer);
const productRepo = AppDataSource.getRepository(Product);
const tableRepo = AppDataSource.getRepository(Table);

// ==================================================
// 🔹 GET all orders
// ==================================================
router.get("/", async (_, res) => {
  try {
    const orders = await orderRepo.find({ relations: ["customer", "table"] });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar pedidos", error });
  }
});

// ==================================================
// 🔹 GET order by ID
// ==================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["customer", "table"],
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

// ==================================================
// 🔹 POST create order (com mesa)
// ==================================================
router.post("/", async (req, res) => {
  try {
    const { customerId, tableId, items } = req.body;

    const customer = await customerRepo.findOneBy({ id: customerId });
    if (!customer)
      return res.status(404).json({ message: "Cliente não encontrado" });

    const table = await tableRepo.findOneBy({ id: tableId });
    if (!table)
      return res.status(404).json({ message: "Mesa não encontrada" });

    table.available = false;
    await tableRepo.save(table);

    const order = orderRepo.create({
      customer,
      table: { id: table.id } as any,
      total: 0,
      status: "pending",
    });
    await orderRepo.save(order);

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await productRepo.findOneBy({ id: item.productId });
      if (!product)
        return res.status(404).json({ message: `Produto ${item.productId} não encontrado` });

      const orderItem = orderItemRepo.create({
        order,
        product,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      total += Number(product.price) * item.quantity;
      await orderItemRepo.save(orderItem);
      orderItems.push(orderItem);
    }

    order.total = total;
    await orderRepo.save(order);

    customer.totalSpent = Number(customer.totalSpent || 0) + total;
    await customerRepo.save(customer);

    const createdOrder = await orderRepo.findOne({
      where: { id: order.id },
      relations: ["customer", "table"],
    });

    // 🔹 inclui os items na resposta
    res.status(201).json({ ...createdOrder, items: orderItems });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(400).json({ message: "Erro ao criar pedido", error });
  }
});

// ==================================================
// 🔹 PATCH update order (status ou liberar mesa)
// ==================================================
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["table"],
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    // atualiza status
    if (status) {
      order.status = status;
      await orderRepo.save(order);

      // ✅ se o pedido for finalizado, liberar a mesa
      if (status.toLowerCase() === "completed" || status.toLowerCase() === "finalizado") {
        if (order.table) {
          const table = await tableRepo.findOneBy({ id: order.table.id });
          if (table) {
            table.available = true;
            await tableRepo.save(table);
          }
        }
      }
    }

    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    res.status(400).json({ message: "Erro ao atualizar pedido", error });
  }
});

// ==================================================
// 🔹 DELETE order (remove e ajusta totalSpent)
// ==================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["table", "customer"],
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    // ✅ liberar mesa
    if (order.table) {
      const table = await tableRepo.findOneBy({ id: order.table.id });
      if (table) {
        table.available = true;
        await tableRepo.save(table);
      }
    }

    // ✅ subtrair valor do pedido do total do cliente
    if (order.customer) {
      const customer = await customerRepo.findOneBy({ id: order.customer.id });
      if (customer) {
        customer.totalSpent = Math.max(
          0,
          Number(customer.totalSpent || 0) - Number(order.total || 0)
        );
        await customerRepo.save(customer);
      }
    }

    await orderRepo.remove(order);

    res.json({ message: "Pedido removido com sucesso e mesa liberada" });
  } catch (error) {
    console.error("Erro ao remover pedido:", error);
    res.status(400).json({ message: "Erro ao remover pedido", error });
  }
});

export default router;
