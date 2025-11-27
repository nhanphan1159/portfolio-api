import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getAbout = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.ABOUT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const about = await db.about.findFirst();
    return c.json(about);
  });
};
