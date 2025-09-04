import express from "express"
import { AppDataSource } from "./database/data-source"
import productRoutes from "./routes/product.routes"
import orderRoutes from "./routes/order.routes"
import customerRoutes from "./routes/customer.routes";

const app = express()
app.use(express.json())

app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);

export default app
