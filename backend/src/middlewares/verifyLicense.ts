import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/data-source";
import { Company } from "../entities/Company";

export const verifyLicense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = Number(req.headers["x-company-id"]);
    if (!companyId) return res.status(400).json({ message: "ID da empresa não fornecido" });

    const companyRepo = AppDataSource.getRepository(Company);
    const company = await companyRepo.findOne({
      where: { id: companyId },
      relations: ["licenses"],
    });

    if (!company) return res.status(404).json({ message: "Empresa não encontrada" });

    const activeLicense = company.licenses.find(
      (l) => l.status === "active" && new Date(l.endDate) >= new Date()
    );

    if (!activeLicense)
      return res.status(403).json({ message: "Licença expirada ou inválida" });

    (req as any).company = company;
    next();
  } catch (error) {
    console.error("Erro na verificação da licença:", error);
    res.status(500).json({ message: "Erro ao verificar licença", error });
  }
};
