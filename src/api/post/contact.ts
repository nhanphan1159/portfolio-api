import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postContact = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.CONTACT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { address, email, phone } = await c.req.json();
    const newContact = await db.contact.create({
      data: { address, email, phone },
    });
    return c.json(newContact);
  });
};
