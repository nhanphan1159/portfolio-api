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
    return c.json(projects);
  });
};
