import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string()
    .max(10)
    .required()
    .messages({
      "string.empty": "El username es obligatorio",
      "string.max": "El username debe tener como máximo 10 caracteres",
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El email es obligatorio",
      "string.email": "El email no es válido",
    }),
  password: Joi.string()
    .min(6)
    .max(10)
    .required()
    .messages({
      "string.empty": "La contraseña es obligatoria",
      "string.max": "La contraseña debe tener como máximo 10 caracteres",
    }),
  name: Joi.string()
    .max(20)
    .allow("")
    .messages({
      "string.max": "El nombre debe tener como máximo 20 caracteres",
    }),
  lastName: Joi.string()
    .max(20)
    .allow("")
    .messages({
      "string.max": "El apellido debe tener como máximo 20 caracteres",
    }),
  bio: Joi.string()
    .max(200)
    .allow("")
    .messages({
      "string.max": "La biografía debe tener como máximo 200 caracteres",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "El email es obligatorio"
    }),
  password: Joi.string()
    .required()
    .messages({
      "string.empty": "La contraseña es obligatoria"
    })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const updatePasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});