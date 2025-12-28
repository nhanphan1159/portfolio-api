import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const deleteExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // Delete single skill
  app.delete(`${ROUTE.API}${ROUTE.EXPERIENCE}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const body = await c.req.json();
    const { id } = body;
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
        where: { id },
      });

      return c.json({
        success: true,
        message: "Experience record deleted successfully",
        data: deletedExperience,
      });
    }
  });

  app.delete(`${ROUTE.API}${ROUTE.EXPERIENCE}/all`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const result = await db.experience.deleteMany({});

    return c.json({
      success: true,
      message: `All experience records deleted (${result.count} records)`,
      count: result.count,
    });
  });
};
