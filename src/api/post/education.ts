import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postEducation = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.EDUCATION}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { school, degree, startAt, endAt, description, GPA } =
      await c.req.json();
    const newEducation = await db.education.create({
      data: { school, degree, startAt, endAt, description, GPA },
    });
    return c.json(newEducation);
  });
};
