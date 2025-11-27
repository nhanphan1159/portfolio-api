import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";
import {
  configureCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary";

export const putProject = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // PUT project with file upload support
  app.put(`${ROUTE.API}${ROUTE.PROJECTS}/:id`, async (c) => {
    try {
      const db = prisma || getPrisma(c.env.portfolio_db);
      const id = parseInt(c.req.param("id"));

      // Check if project exists
      const existingProject = await db.project.findUnique({
        where: { id },
      });

      if (!existingProject) {
        return c.json({ error: "Project not found" }, 404);
      }

      // Configure Cloudinary
      configureCloudinary(c.env);

      // Parse multipart form data
      const body = await c.req.parseBody();

      const title = body["title"] as string;
      const task = body["task"] as string;
      const url = body["url"] as string;
      const imgMainFile = body["imgMain"];
      const imgFiles = body["img"];

      // Prepare update data
      const updateData: any = {};

      if (title) updateData.title = title;
      if (task) updateData.task = task;
      if (url !== undefined) updateData.url = url;

      // Upload new imgMain if provided
      if (imgMainFile && imgMainFile instanceof File) {
        const arrayBuffer = await imgMainFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const result = await uploadToCloudinary(buffer, "portfolio/projects");
        updateData.imgMain = result.secureUrl;
      }

      // Upload new img array if provided
      if (imgFiles) {
        const imgUrls: string[] = [];
        const fileArray = Array.isArray(imgFiles) ? imgFiles : [imgFiles];

        for (const file of fileArray) {
          if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const result = await uploadToCloudinary(
              buffer,
              "portfolio/projects"
            );
            imgUrls.push(result.secureUrl);
          }
        }

        if (imgUrls.length > 0) {
          updateData.img = JSON.stringify(imgUrls);
        }
      }

      // Update project
      const project = await db.project.update({
        where: { id },
        data: updateData,
      });

      return c.json({
        success: true,
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      return c.json(
        {
          error: "Failed to update project",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });

  // PUT project with URL only (no file upload)
  app.put(`${ROUTE.API}${ROUTE.PROJECTS}/:id/url`, async (c) => {
    const db = prisma || getPrisma(c.env.portfolio_db);

    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { title, task, imgMain, img, url } = body;

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
        ...(imgMain && { imgMain }),
        ...(imgString && { img: imgString }),
        ...(url !== undefined && { url }),
      },
    });

    return c.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
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
