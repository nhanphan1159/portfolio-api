import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.EXPERIENCE}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const experience = await db.experience.findMany();
    return c.json(experience);
  });
};
