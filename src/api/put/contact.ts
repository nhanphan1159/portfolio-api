import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putContact = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.CONTACT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const { id, address, email, phone } = await c.req.json();
    const updatedContact = await db.contact.update({
      where: { id },
      data: { address, email, phone },
    });
    return c.json(updatedContact);
  });
};
