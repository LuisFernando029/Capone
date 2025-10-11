import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import { authenticateToken } from "../middlewares/auth.middleware";
import bcrypt from "bcrypt";

const router = Router();
const repo = AppDataSource.getRepository(User);

// Todas as rotas abaixo exigem token
router.use(authenticateToken);

// GET /users/me → retorna o próprio usuário logado
router.get("/me", async (req, res) => {
  const userReq = (req as any).user; // vem do token

  const user = await repo.findOneBy({ id: userReq.id });
  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  // opcional: não retornar o hash da senha
  const { password, ...userData } = user;
  res.json(userData);
});

// GET all users (somente admin)
router.get("/", async (req, res) => {
  const user = (req as any).user;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const users = await repo.find();
  res.json(users);
});

// GET user by ID (pode ver só o próprio ou admin)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const userReq = (req as any).user;

  if (userReq.role !== "admin" && userReq.id !== Number(id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const user = await repo.findOneBy({ id: Number(id) });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  res.json(user);
});

// PATCH update user (próprio ou admin)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const userReq = (req as any).user;
  const { password, ...rest } = req.body;

  if (userReq.role !== "admin" && userReq.id !== Number(id)) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const user = await repo.findOneBy({ id: Number(id) });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  if (password) rest.password = await bcrypt.hash(password, 10);
  repo.merge(user, rest);
  const updated = await repo.save(user);
  res.json(updated);
});




// DELETE user (somente admin)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const userReq = (req as any).user;

  if (userReq.role !== "admin") {
    return res.status(403).json({ message: "Acesso negado" });
  }

  const user = await repo.findOneBy({ id: Number(id) });
  if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

  await repo.remove(user);
  res.json({ message: "Usuário removido com sucesso" });
});

export default router;
