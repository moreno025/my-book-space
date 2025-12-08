import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../utils/nodemailer.js";

// ------------------------
// Register
// ------------------------
export const register = async (req, res) => {
    try {
        const { username, name, lastName, bio, avatar, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "Usuario o email ya existe" });
        }

        const user = await User.create({ username, email, password, name, lastName, bio });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            name: user.name,
            lastName: user.lastName,
            bio: user.bio,
        },
        token,
        });

    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


// ------------------------
// Login
// ------------------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son obligatorios" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email o contraseña incorrectos" });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email o contraseña incorrectos" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                name: user.name,
                lastName: user.lastName,
                bio: user.bio,
            },
            token,
      refreshToken,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
};


// ------------------------
// Refresh Token
// ------------------------
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token requerido" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: "Refresh token inválido" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    res.status(200).json({ token });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token inválido o expirado" });
  }
};


// ------------------------
// Logout
// ------------------------
export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token requerido" });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    // Eliminar refresh token de DB
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save();

    res.status(200).json({ message: "Logout exitoso" });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token inválido o expirado" });
  }
};


// ------------------------
// Forgot Password
// ------------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requerido" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

    // Generar token temporal de recuperación
    const token = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: "1h" });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    await sendPasswordResetEmail(email, token);

    res.status(200).json({ message: "Email de recuperación enviado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ------------------------
// Update Password
// ------------------------
export const updatePassword = async (req, res) => {

  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token y nueva contraseña requeridos" });

  try {
    const payload = jwt.verify(token, process.env.JWT_RESET_SECRET);

    const user = await User.findOne({
      _id: payload.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};


