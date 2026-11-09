import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const deleteExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // Must be registered before "/:id" so "all" is not captured as an id
  app.delete(`${ROUTE.API}${ROUTE.EXPERIENCE}/all`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const result = await db.experience.deleteMany({});

    return c.json({
      success: true,
      message: `All experience records deleted (${result.count} records)`,
      count: result.count,
    });
  });

  // Delete single or multiple experience records by comma-separated ID(s), e.g. /experience/1,2
  app.delete(`${ROUTE.API}${ROUTE.EXPERIENCE}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const idsParam = c.req.param("id");
    const id = idsParam.split(",").map((id) => parseInt(id, 10));

    if (id.some((n) => Number.isNaN(n))) {
      return c.json({ error: "Invalid id" }, 400);
    }

    if (id.length >= 2) {
      const deletedExperiences = await db.experience.deleteMany({
        where: {
          id: { in: id },
        },
      });

      return c.json({
        success: true,
        message: `${deletedExperiences.count} experience record(s) deleted successfully`,
        count: deletedExperiences.count,
      });
    } else {
      const deletedExperience = await db.experience.delete({
        where: { id: id[0] },
      });

      return c.json({
        success: true,
        message: "Experience record deleted successfully",
        data: deletedExperience,
      });
    }
  });
};
