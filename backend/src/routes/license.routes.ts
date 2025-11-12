import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { License } from "../entities/License";
import { Company } from "../entities/Company";
import crypto from "crypto";

const router = Router();
const licenseRepo = AppDataSource.getRepository(License);
const companyRepo = AppDataSource.getRepository(Company);

// POST create license
router.post("/", async (req, res) => {
  try {
    const { companyId, durationDays, maxUsers, maxTables } = req.body;

    const company = await companyRepo.findOneBy({ id: companyId });
    if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const license = licenseRepo.create({
      company,
      key: crypto.randomUUID(),
      startDate,
      endDate,
      status: "active",
      maxUsers,
      maxTables,
    });

    await licenseRepo.save(license);
    res.status(201).json(license);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao criar licença", error });
  }
});

// GET all licenses
router.get("/", async (_, res) => {
  const licenses = await licenseRepo.find({ relations: ["company"] });
  res.json(licenses);
});

export default router;
