import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const getContact = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.get(`${ROUTE.API}${ROUTE.CONTACT}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const contacts = await db.contact.findMany();
    return c.json(contacts);
  });
};
