import { cors } from "hono/cors";

export const corsMiddleware = () => {
  return cors({
    origin: "*", // Allow all origins, hoặc specify domain của bạn
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
};
