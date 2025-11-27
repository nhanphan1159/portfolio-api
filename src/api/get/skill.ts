import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getSkill = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.SKILLS}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const skills = await db.skill.findMany();
    return c.json(skills.map((s: { name: string }) => s.name));
  });
};
