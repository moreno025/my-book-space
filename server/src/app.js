import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";
import { security } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import bookListRoutes from "./routes/bookList.routes.js";


const __filename = path.resolve(process.cwd(), 'src/app.js'); // Fallback or strict location
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// Necesario si usas Nginx / proxies / HTTPS en producción
app.set("trust proxy", 1);

// Conectar a MongoDB
connectDB();

// Middlewares base
app.use(express.json());
app.use(cors());

// Seguridad (helmet + sanitización + rate limit + mongoSanitize + xss)
security(app);

// Logger HTTP con morgan + winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Rutas
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/book-list", bookListRoutes);

// Manejo global de errores (siempre el último middleware)
app.use(errorHandler);

export default app;
