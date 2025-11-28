import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";

export const deleteSkill = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // Delete single skill
  app.delete(`${ROUTE.API}${ROUTE.SKILLS}`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);
    const body = await c.req.json();
    const { id } = body;
    if (id.length >= 2) {
      const deletedSkills = await db.skill.deleteMany({
        where: {
          id: { in: id },
        },
      });

      return c.json({
        success: true,
        message: `${deletedSkills.count} skill(s) deleted successfully`,
        count: deletedSkills.count,
      });
    } else {
      const deletedSkill = await db.skill.delete({
        where: { id },
      });

      return c.json({
        success: true,
        message: "Skill deleted successfully",
        data: deletedSkill,
      });
    }
  });

  // Delete ALL skills (dangerous - use with caution)
  app.delete(`${ROUTE.API}${ROUTE.SKILLS}/all`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const result = await db.skill.deleteMany({});

    return c.json({
      success: true,
      message: `All skills deleted (${result.count} records)`,
      count: result.count,
    });
  });
};
