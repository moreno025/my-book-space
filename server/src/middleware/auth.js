import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No autorizado, token faltante" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Usuario no existe" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en middleware protect:", error);
    return res.status(401).json({ message: "No autorizado, token inválido" });
  }
};
