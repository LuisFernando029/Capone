import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token não fornecido" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string; email: string };
    (req as any).user = decoded; // injeta user no req
    next();
  } catch {
    return res.status(403).json({ message: "Token inválido ou expirado" });
  }
}
