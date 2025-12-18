import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putEducation = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.EDUCATION}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { id, school, degree, startAt, endAt, description, GPA } =
      await c.req.json();
    const updatedEducation = await db.education.update({
      where: { id },
      data: { school, degree, startAt, endAt, description, GPA },
    });
    return c.json(updatedEducation);
  });
};
