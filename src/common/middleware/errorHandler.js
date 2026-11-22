import { ZodError } from "zod";

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: err.issues.map((i) => i.message).join(", "),
    });
  }

  const status = err.cause || 500;
  res.status(status).json({
    message: err.message || req.t?.("server.error") || "Internal server error",
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};