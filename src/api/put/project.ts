import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const putProject = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  app.put(`${ROUTE.API}${ROUTE.PROJECTS}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { title, task, imgmain, img, url } = body;

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    // Convert img array to JSON string if it's an array
    const imgString = Array.isArray(img) ? JSON.stringify(img) : img;

    const project = await db.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(task && { task }),
        ...(imgmain && { imgmain }),
        ...(imgString && { img: imgString }),
        ...(url !== undefined && { url }),
      },
    });

    return c.json(project);
  });

  // DELETE project
  app.delete(`${ROUTE.API}${ROUTE.PROJECTS}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const id = parseInt(c.req.param("id"));

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }

    await db.project.delete({
      where: { id },
    });

    return c.json({ message: "Project deleted successfully" });
  });
};
