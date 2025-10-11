import { Router } from "express";
import { AppDataSource } from "../database/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";

const router = Router();
const repo = AppDataSource.getRepository(User);

// POST /register → Criação de usuário
router.post("/register", async (req, res) => {
  try {
    const { email, name, role, password } = req.body;

    const existingUser = await repo.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = repo.create({
      email,
      name,
      role,
      password: hashedPassword,
    });

    await repo.save(user);

    res.status(201).json({
      message: "Usuário criado com sucesso",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("❌ Erro ao registrar usuário:", error);
    res.status(500).json({ message: "Erro ao registrar usuário", error });
  }
});

// POST /login → Autenticação
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await repo.findOneBy({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    // 🔑 Aqui é onde você pode adicionar:
    // req.session.userId = user.id;
    // depois de configurar express-session

    res.json({
      message: "Login bem-sucedido",
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao fazer login", error });
  }
});

export default router;
