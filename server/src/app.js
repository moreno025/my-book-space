import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";

import logger from "./utils/logger.js";
import { security } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import bookListRoutes from "./routes/bookList.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import bookRoutes from "./routes/book.routes.js";


const __filename = path.resolve(process.cwd(), 'src/app.js'); // Fallback or strict location
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// Necesario si usas Nginx / proxies / HTTPS en producción
app.set("trust proxy", 1);


// Middlewares base
app.use(express.json());

//CORS
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Seguridad (helmet + sanitización + rate limit + mongoSanitize + xss)
security(app);

// Logger HTTP con morgan + winston
/*app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);    PRODUCCION */

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}


// Rutas
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/book-list", bookListRoutes);
app.use("/review", reviewRoutes);
app.use("/book", bookRoutes);

// Manejo global de errores (siempre el último middleware)
app.use(errorHandler);

export default app;
