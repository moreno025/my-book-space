import multer from "multer";
import fs from "fs";
import path from "path";



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";

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
