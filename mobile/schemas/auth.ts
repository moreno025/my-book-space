import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
    username: z.string().max(10, "Máximo 10 caracteres").nonempty("Username obligatorio"),
    email: z.string().email("Email inválido").nonempty("Email obligatorio"),
    password: z.string().max(7, "Máximo 7 caracteres").nonempty("Contraseña obligatoria"),
    name: z.string().max(20).optional(),
    lastName: z.string().max(20).optional(),
    bio: z.string().max(200).optional(),
});

export const forgotPasswordSchema = z.object({
    email: z.string().email("Email inválido"),
});
