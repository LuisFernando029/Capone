import { AppDataSource } from "./database/data-source";
import app from "./server";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected!");
    app.listen(4000, "0.0.0.0",() => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Database connection failed:", error));
