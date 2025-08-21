import express from "express"
import { AppDataSource } from "./database/data-source"
import productRoutes from "./routes/product.routes"

const app = express()
app.use(express.json())

app.use("/products", productRoutes)

export default app
