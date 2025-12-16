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
    const id = parseInt(c.req.param("id") || "0", 10);
    const projects = await db.project.findUnique({
      where: { id },
    });
    return c.json(projects);
  });
};
