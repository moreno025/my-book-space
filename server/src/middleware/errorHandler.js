import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
  });

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
};
