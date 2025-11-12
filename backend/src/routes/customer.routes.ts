import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Customer } from "../entities/Customer";
import { verifyLicense } from "../middlewares/verifyLicense";

const router = Router();
const repo = AppDataSource.getRepository(Customer);

// GET all customers
router.get("/", async (_, res) => {
  const customers = await repo.find({ relations: ["company"] });
  res.json(customers);
});

// GET customer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await repo.findOne({
      where: { id: Number(id) },
      relations: ["company"],
    });

    if (!customer) return res.status(404).json({ message: "Cliente não encontrado" });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar cliente", error });
  }
});

// POST create customer
router.post("/", verifyLicense, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const company = (req as any).company;

    const existing = await repo.findOne({ where: { email, company: { id: company.id } } });
    if (existing)
      return res.status(400).json({ message: "Já existe um cliente com esse e-mail nesta empresa" });

    const customer = repo.create({ name, email, phone, company });
    await repo.save(customer);

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar cliente", error });
  }
});

// PATCH update customer
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await repo.findOneBy({ id: Number(id) });
    if (!customer) return res.status(404).json({ message: "Cliente não encontrado" });

    repo.merge(customer, req.body);
    const updated = await repo.save(customer);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar cliente", error });
  }
});

// DELETE remove customer
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await repo.findOneBy({ id: Number(id) });
    if (!customer) return res.status(404).json({ message: "Cliente não encontrado" });

    await repo.remove(customer);
    res.json({ message: "Cliente removido com sucesso" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao remover cliente", error });
  }
});

export default router;
