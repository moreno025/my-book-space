import Joi from "joi";

export const createReviewSchema = Joi.object({
  bookId: Joi.string().required().messages({
    "string.empty": "El ID del libro es obligatorio",
    "any.required": "El ID del libro es obligatorio",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "La puntuación debe ser un número",
    "number.min": "La puntuación mínima es 1",
    "number.max": "La puntuación máxima es 5",
    "any.required": "La puntuación es obligatoria",
  }),
  review: Joi.string().max(500).allow("").messages({
    "string.max": "La reseña no puede tener más de 500 caracteres",
  }),
  listId: Joi.string().optional(),
});
