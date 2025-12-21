import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
import https from "https";
import fs from "fs";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4000;

/*const options = {
  key: fs.readFileSync("./src/https/key.pem"),
  cert: fs.readFileSync("./src/https/cert.pem"),
}; PRODUCCION   */

// Conexion db
await connectDB();

//https.createServer(options, app).listen(PORT, () => {   PRODUCCION
http.createServer(app).listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
