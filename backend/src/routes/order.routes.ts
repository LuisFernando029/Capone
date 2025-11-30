import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";
import { Product } from "../entities/Products";
import { Table } from "../entities/Table";

const router = Router();
const orderRepo = AppDataSource.getRepository(Order);
const orderItemRepo = AppDataSource.getRepository(OrderItem);
const productRepo = AppDataSource.getRepository(Product);
const tableRepo = AppDataSource.getRepository(Table);

// GET all orders
router.get("/", async (_, res) => {
  try {
    const orders = await orderRepo.find({
      relations: ["table", "items", "items.product"],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pedidos", error });
  }
});

// GET order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["table", "items", "items.product"],
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar pedido", error });
  }
});

// POST create order (com validação de estoque)
router.post("/", async (req, res) => {
  try {
    const { tableId, customerName, status, notes, items } = req.body;

    // Validação básica
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        message: "Nome do cliente é obrigatório"
      });
    }

    // Se tableId foi fornecido, validar se existe
    let table = undefined;
    if (tableId) {
      table = await tableRepo.findOneBy({ id: tableId });
      if (!table) {
        return res.status(404).json({
          message: `Mesa ID ${tableId} não encontrada`
        });
      }
    }

    // Validar estoque para todos os itens ANTES de criar o pedido
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await productRepo.findOneBy({ id: item.productId });
        
        if (!product) {
          return res.status(404).json({
            message: `Produto ID ${item.productId} não encontrado`
          });
        }

        if (!product.isAvailable) {
          return res.status(400).json({
            message: `Produto "${product.name}" não está disponível`
          });
        }

        if (product.quantity < item.quantity) {
          return res.status(400).json({
            message: `Estoque insuficiente para "${product.name}"`,
            available: product.quantity,
            requested: item.quantity
          });
        }
      }
    }

    // Criar pedido
    const order = orderRepo.create({
      table: table,
      customerName: customerName.trim(),
      status: status || 'pending',
      notes,
    });

    await orderRepo.save(order);

    // Criar itens e reduzir estoque
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await productRepo.findOneBy({ id: item.productId });
        
        // Criar item do pedido
        const orderItem = orderItemRepo.create({
          order,
          product: { id: item.productId },
          quantity: item.quantity,
          unitPrice: item.price || product!.price,
          notes: item.notes,
        });
        await orderItemRepo.save(orderItem);

        // Reduzir estoque
        product!.quantity -= item.quantity;
        await productRepo.save(product!);
      }
    }

    const savedOrder = await orderRepo.findOne({
      where: { id: order.id },
      relations: ["table", "items", "items.product"],
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(400).json({ message: "Erro ao criar pedido", error });
  }
});

// PATCH update order
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOneBy({ id: Number(id) });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    // Se está atualizando customerName, validar
    if (req.body.customerName !== undefined) {
      if (!req.body.customerName || !req.body.customerName.trim()) {
        return res.status(400).json({
          message: "Nome do cliente não pode ser vazio"
        });
      }
      req.body.customerName = req.body.customerName.trim();
    }

    // Se está atualizando tableId, validar se existe
    if (req.body.tableId !== undefined) {
      if (req.body.tableId) {
        const table = await tableRepo.findOneBy({ id: req.body.tableId });
        if (!table) {
          return res.status(404).json({
            message: `Mesa ID ${req.body.tableId} não encontrada`
          });
        }
        req.body.table = table;
      } else {
        req.body.table = null;
      }
      delete req.body.tableId;
    }

    orderRepo.merge(order, req.body);
    const updated = await orderRepo.save(order);

    const result = await orderRepo.findOne({
      where: { id: updated.id },
      relations: ["table", "items", "items.product"],
    });

    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(400).json({ message: "Erro ao atualizar pedido", error });
  }
});

// DELETE remove order (devolve estoque)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderRepo.findOne({
      where: { id: Number(id) },
      relations: ["items", "items.product"],
    });

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    // Devolver estoque antes de deletar
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const product = await productRepo.findOneBy({ id: item.product.id });
        if (product) {
          product.quantity += item.quantity;
          await productRepo.save(product);
        }
      }
    }

    await orderRepo.remove(order);

    res.json({ message: "Pedido removido com sucesso e estoque devolvido" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover pedido", error });
  }
});

// POST add item to order (com validação de estoque)
router.post("/:id/items", async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, price, notes } = req.body;

    const order = await orderRepo.findOneBy({ id: Number(id) });
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const product = await productRepo.findOneBy({ id: productId });
    if (!product) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        message: `Produto "${product.name}" não está disponível`
      });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({
        message: `Estoque insuficiente para "${product.name}"`,
        available: product.quantity,
        requested: quantity
      });
    }

    const orderItem = orderItemRepo.create({
      order,
      product: { id: productId },
      quantity,
      unitPrice: price || product.price,
      notes,
    });

    await orderItemRepo.save(orderItem);

    // Reduzir estoque
    product.quantity -= quantity;
    await productRepo.save(product);

    res.status(201).json(orderItem);
  } catch (error) {
    res.status(400).json({ message: "Erro ao adicionar item", error });
  }
});

// PATCH update order item (ajusta estoque)
router.patch("/:orderId/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity: newQuantity } = req.body;

    const item = await orderItemRepo.findOne({
      where: { id: Number(itemId) },
      relations: ["product"]
    });

    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    // Se mudou a quantidade, ajustar estoque
    if (newQuantity && newQuantity !== item.quantity) {
      const product = await productRepo.findOneBy({ id: item.product.id });
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const difference = newQuantity - item.quantity;

      // Se aumentou a quantidade, verificar estoque
      if (difference > 0) {
        if (product.quantity < difference) {
          return res.status(400).json({
            message: `Estoque insuficiente para "${product.name}"`,
            available: product.quantity,
            requested: difference
          });
        }
        product.quantity -= difference;
      } else {
        // Se diminuiu a quantidade, devolver ao estoque
        product.quantity += Math.abs(difference);
      }

      await productRepo.save(product);
    }

    orderItemRepo.merge(item, req.body);
    const updated = await orderItemRepo.save(item);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar item", error });
  }
});

// DELETE remove order item (devolve estoque)
router.delete("/:orderId/items/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await orderItemRepo.findOne({
      where: { id: Number(itemId) },
      relations: ["product"]
    });

    if (!item) {
      return res.status(404).json({ message: "Item não encontrado" });
    }

    // Devolver estoque
    const product = await productRepo.findOneBy({ id: item.product.id });
    if (product) {
      product.quantity += item.quantity;
      await productRepo.save(product);
    }

    await orderItemRepo.remove(item);

    res.json({ message: "Item removido com sucesso e estoque devolvido" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover item", error });
  }
});

export default router;
