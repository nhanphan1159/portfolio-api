import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getProject = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.PROJECTS}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const projects = await db.project.findMany();

    // Parse img JSON string to array for client convenience
    const normalized = projects.map((p) => ({
      ...p,
      img: safeParseArray(p.img),
    }));

    return c.json(normalized);
  });
};

// Parse a JSON string to array; fallback to [] if invalid
const safeParseArray = (value: string | null | undefined) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};
