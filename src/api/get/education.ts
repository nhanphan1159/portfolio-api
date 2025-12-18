import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getEducation = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.EDUCATION}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const education = await db.education.findMany();
    return c.json(education);
  });
};
