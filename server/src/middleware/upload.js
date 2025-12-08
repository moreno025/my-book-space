import multer from "multer";
import path from "path";
import fs from "fs";

// Carpeta destino de los uploads
const uploadPath = path.join(process.cwd(), "src/uploads/usuarios");

// Crear carpeta si no existe
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user._id}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Solo imágenes
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Solo se permiten imágenes"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
