import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    cb(null, `avatar-${req.user._id}.${ext}`);
  }
});



function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Solo se permiten imágenes JPG, PNG o WebP"));
  }

  cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 } // 2MB
}).single("avatar");

const clubStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/clubs");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Use clubId if available in params, otherwise user ID + timestamp (creation)
    const identifier = req.params.clubId || `new-${req.user._id}`;
    cb(null, `club-${identifier}-${Date.now()}${ext}`);
  }
});

export const uploadClubAvatar = multer({
  storage: clubStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single("avatar");



export const removeOldAvatar = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const user = req.user;

    if (user.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) =>
          err && console.error("❌ Error eliminando avatar antiguo:", err)
        );
      }
    }

    next();
  } catch (error) {
    console.error("❌ Error removeOldAvatar:", error);
    next();
  }
};
