import express from "express"
import productRoutes from "./routes/product.routes"
import orderRoutes from "./routes/order.routes"
import customerRoutes from "./routes/customer.routes";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = express()
app.use(express.json())

app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

export default app
