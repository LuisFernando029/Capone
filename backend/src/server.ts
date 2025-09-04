import express from "express";
import productRoutes from "./routes/product.routes"
import customerRoutes from "./routes/customer.routes"
import orderRoutes from "./routes/order.routes"

const app = express();

app.use(express.json());
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);

export default app;
