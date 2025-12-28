import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.EXPERIENCE}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { id, name } = await c.req.json();
    const updatedExperience = await db.experience.update({
      where: { id },
      data: { name },
    });
    return c.json(updatedExperience);
  });
};
