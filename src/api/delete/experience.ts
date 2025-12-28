import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const deleteExperience = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // Delete single or multiple experience records by ID(s) in URL
  app.delete(`${ROUTE.API}${ROUTE.EXPERIENCE}/:id`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const idsParam = c.req.param("id");
    const id = idsParam.split("/").map((id) => parseInt(id));

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
