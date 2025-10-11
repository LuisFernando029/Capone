import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";

const router = Router();
const repo = AppDataSource.getRepository(User);

// GET all users
router.get("/", async (_, res) => {
  try {
    const users = await repo.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar usuários", error });
  }
});

// GET user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await repo.findOneBy({ id: Number(id) });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Erro ao buscar usuário", error });
  }
});


// PATCH update user
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...rest } = req.body;
    const user = await repo.findOneBy({ id: Number(id) });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      rest.password = hashedPassword;
    }

    repo.merge(user, rest);
    const updated = await repo.save(user);

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Erro ao atualizar usuário", error });
  }
});

// DELETE remove user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await repo.findOneBy({ id: Number(id) });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await repo.remove(user);

    res.json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    res.status(400).json({ message: "Erro ao remover usuário", error });
  }
});

export default router;
