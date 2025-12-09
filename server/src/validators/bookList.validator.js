import Joi from "joi";


export const bookListSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(30)
    .required()
    .messages({
      "string.empty": "El título es obligatorio",
      "string.max": "El título no puede tener más de 30 caracteres",
      "any.required": "El título es obligatorio",
    }),
  description: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .messages({
      "string.max": "La descripción no puede tener más de 100 caracteres",
    }),
  isPublic: Joi.boolean().optional(),
  books: Joi.array()
    .items(
      Joi.object({
        googleBookId: Joi.string().required(),
        title: Joi.string().required(),
        authors: Joi.array().items(Joi.string()),
        thumbnail: Joi.string().uri().optional(),
        publishedDate: Joi.string().optional(),
      })
    )
    .optional(),
});
