import { Hono } from "hono";
import { isDateValid, isStartBeforeEnd, ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.EXPERIENCE}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const id = parseInt(c.req.param("id"), 10);
    if (Number.isNaN(id)) {
      return c.json({ error: "Invalid id" }, 400);
    }
    const { startAt, endAt, role, company, job } = await c.req.json();

    if (!isDateValid(startAt) || !isDateValid(endAt)) {
      return c.json({ error: "Invalid date format. Use MM-YYYY." }, 400);
    }

    const compare = isStartBeforeEnd(startAt, endAt);
    if (!compare.valid) {
      return c.json({ error: compare.message }, 400);
    }
    const updatedExperience = await db.experience.update({
      where: { id },
      data: { startAt, endAt, role, company, job },
    });
    return c.json(updatedExperience);
  });
};
