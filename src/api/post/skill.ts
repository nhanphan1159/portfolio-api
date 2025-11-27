import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postSkill = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.SKILLS}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { name } = await c.req.json();
    const newSkill = await db.skill.create({ data: { name } });
    return c.json(newSkill);
  });
};
