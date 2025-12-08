import dotenv from "dotenv";
dotenv.config();
import https from "https";
import fs from "fs";
import app from "./app.js";

const PORT = process.env.PORT || 4000;

const options = {
  key: fs.readFileSync("./src/https/key.pem"),
  cert: fs.readFileSync("./src/https/cert.pem"),
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
