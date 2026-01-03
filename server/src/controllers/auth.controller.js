import User from "../models/user.model.js";
import BookList from "../models/bookList.model.js";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail, sendEmailChangedEmail, sendVerifyNewEmail } from "../utils/nodemailer.js";

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

        // Crear lista por defecto "Wishlist"
        await BookList.create({
            title: "Wishlist",
            description: "Mi lista de deseos",
            visibility: "private",
            user: user._id,
            books: []
        });

        // Crear lista por defecto "Favourite Books"
        await BookList.create({
            title: "Favourite Books",
            description: "Mis libros favoritos",
            visibility: "public",
            user: user._id,
            books: []
        });

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
            isPrivate: user.isPrivate,
        },
        token,
        });

    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: error.message });
    }
};


// ------------------------
// Login
// ------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email y contraseña son obligatorios" });

    const user = await User.findOne({ email }).select("+password");

    if (!user) return res.status(400).json({ message: "Email o contraseña incorrectos" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Email o contraseña incorrectos" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    user.refreshTokens = [refreshToken];
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
        isPrivate: user.isPrivate,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: "1h" });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Enviar email con nodemailer (producción vía OAuth2)
    await sendPasswordResetEmail(email, token);

    return res.status(200).json({ message: "Email de recuperación enviado" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
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

    // opcional: notificar por email que la contraseña cambió
    // await sendPasswordChangeNotification(user.email);

    return res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en updatePassword:", err);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};


// ------------------------
// Update User Profile
// ------------------------
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.user._id);

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const oldEmail = user.email;
    const newEmail = updates.email;


    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }


    if (updates.isPrivate !== undefined) {
      updates.isPrivate = updates.isPrivate === "true" || updates.isPrivate === true;
    }

    const oldIsPrivate = user.isPrivate;
    Object.assign(user, updates);

    await user.save();


    if (newEmail && newEmail !== oldEmail) {
      await sendEmailChangedEmail(oldEmail, newEmail);
    }

    return res.status(200).json({
      message: "Perfil actualizado",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        isPrivate: user.isPrivate,
      }
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor" });
  }
};



// ------------------------
// Request Email Change
// ------------------------
export const requestEmailChange = async (req, res) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password)
    return res.status(400).json({ message: "Nuevo correo y contraseña son requeridos" });

  try {
    const user = await User.findById(req.user._id).select("+password");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });

    // Generar token temporal de verificación
    const token = jwt.sign(
      { id: user._id, newEmail },
      process.env.JWT_EMAIL_CHANGE_SECRET,
      { expiresIn: "1h" }
    );

    user.pendingEmail = newEmail;
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    await sendVerifyNewEmail(newEmail, token);

    res.status(200).json({
      message: "Revisa tu nuevo correo para confirmar el cambio",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


// ------------------------
// Verify New Email
// ------------------------
export const verifyNewEmail = async (req, res) => {
  let { token } = req.query;

  if (!token) return res.status(400).json({ message: "Token requerido" });

  token = token.trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_CHANGE_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Validaciones reales
    if (
      !user.emailVerificationToken ||
      user.emailVerificationToken !== token ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Correo actualizado correctamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Token inválido o expirado" });
  }
};
