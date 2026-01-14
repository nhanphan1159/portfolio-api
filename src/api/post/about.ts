import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postAbout = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.ABOUT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { content, name, role } = await c.req.json();
    const newAbout = await db.about.create({
      data: { content, name, role },
    });
    return c.json(newAbout);
  });
};
