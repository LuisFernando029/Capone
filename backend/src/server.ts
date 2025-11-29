import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes";
import customerRoutes from "./routes/customer.routes";
import orderRoutes from "./routes/order.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import tableRoutes from "./routes/table.routes";

const app = express();

// ✅ Habilita CORS antes de qualquer rota ou middleware
app.use(
  cors({
    origin: "*", // em dev, deixa aberto — em prod, substitua pelo domínio do app
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Garante que as requisições OPTIONS (pré-flight) sejam respondidas
app.options("*", cors());

// ✅ Permite JSON no corpo das requisições
app.use(express.json());

// ✅ Suas rotas
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/users", userRoutes);
app.use("/orders", orderRoutes);
app.use("/tables", tableRoutes);


export default app;
