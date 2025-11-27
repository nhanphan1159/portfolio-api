import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const postProject = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.post(`${ROUTE.API}${ROUTE.PROJECTS}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const body = await c.req.json();
    const { title, task, imgMain, img, url } = body;

    // Validate required fields
    if (!title || !task || !imgMain) {
      return c.json(
        { error: "Missing required fields: title, task, imgMain" },
        400
      );
    }

    // Convert img array to JSON string if it's an array
    const imgString = Array.isArray(img) ? JSON.stringify(img) : img || "[]";

    const project = await db.project.create({
      data: {
        title,
        task,
        imgMain,
        img: imgString,
        url: url || null,
      },
    });

    return c.json(project, 201);
  });
};
