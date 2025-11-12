import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { Company } from "../entities/Company";

const router = Router();
const companyRepo = AppDataSource.getRepository(Company);

// ✅ Criar nova empresa
router.post("/", async (req, res) => {
  try {
    const { name, cnpj, email } = req.body;
    const existing = await companyRepo.findOneBy({ cnpj });
    if (existing) return res.status(400).json({ message: "CNPJ já cadastrado" });

    const company = companyRepo.create({ name, cnpj, email });
    await companyRepo.save(company);

    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: "Erro ao criar empresa", error });
  }
});

// ✅ Buscar todas empresas
router.get("/", async (_, res) => {
  const companies = await companyRepo.find({ relations: ["licenses"] });
  res.json(companies);
});

export default router;
