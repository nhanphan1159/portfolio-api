import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putAbout = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.ABOUT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { id, content, name, role } = await c.req.json();
    const updatedAbout = await db.about.update({
      where: { id },
      data: { content, name, role },
    });
    console.log("About updated:", updatedAbout);
    return c.json(updatedAbout);
  });
};
