import xss from "xss";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Sanitiza recursivamente un objeto
const sanitizeObject = (obj) => {
  if (typeof obj !== "object" || obj === null) return obj;

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
};

export const security = (app) => {
  // Seguridad en cabeceras
  app.use(helmet());

  // Rate Limit (protege contra brute force / DDoS)
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: "Too many requests from this IP",
    })
  );

  // Anti inyección NoSQL ($gt, $ne...)
  app.use((req, res, next) => {
    if (req.body) mongoSanitize.sanitize(req.body);
    if (req.query) mongoSanitize.sanitize(req.query);
    if (req.params) mongoSanitize.sanitize(req.params);
    next();
  });

  // Sanitización XSS en body, params y query
  app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
  });
};
