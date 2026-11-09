import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getProjectDetail = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.PROJECTS}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const id = parseInt(c.req.param("id") || "", 10);
    if (Number.isNaN(id)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const project = await db.project.findUnique({
      where: { id },
    });
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    return c.json({ ...project, img: safeParseArray(project.img) });
  });
};

const safeParseArray = (value: string | null | undefined) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
