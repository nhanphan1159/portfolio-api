import { Hono } from "hono";
import { isDateValid, isStartBeforeEnd, ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.EXPERIENCE}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { startAt, endAT, role, company, job } = await c.req.json();

    if (!isDateValid(startAt) || !isDateValid(endAT)) {
      return c.json({ error: "Invalid date format. Use MM-YYYY." }, 400);
    }

    const compare = isStartBeforeEnd(startAt, endAT);
    if (!compare.valid) {
      return c.json({ error: compare.message }, 400);
    }
    console.log(startAt, endAT, role, company, job);
    const newExperience = await db.experience.create({
      data: { startAt, endAT, role, company, job },
    });
    return c.json(newExperience);
  });
};
