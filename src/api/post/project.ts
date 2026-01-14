import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import { getPrisma } from "../../connection/db";
import { PrismaClient } from "@prisma/client";
import {
  configureCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary";

export const postProject = (
  app: Hono<{ Bindings: IBindings }>,
  prisma?: PrismaClient
) => {
  // POST project with file upload support
  app.post(`${ROUTE.API}${ROUTE.PROJECTS}`, async (c) => {
    try {
      // Check if D1 database is available
      if (!prisma && !c.env.portfolio_db) {
        return c.json(
          {
            error: "Database not configured",
            details: "D1 database binding is missing",
          },
          500
        );
      }

      const db = prisma || getPrisma(c.env.portfolio_db);

      // Configure Cloudinary
      configureCloudinary(c.env);

      // Parse multipart form data - parseBody has limitations with multiple files
      const body = await c.req.parseBody({ all: true });

      const title = body["title"] as string;
      const url = body["url"] as string;

      // Handle imgMain - can be single value or array (take first if array)
      let imgMainFile = body["imgMain"];
      if (Array.isArray(imgMainFile)) {
        imgMainFile = imgMainFile[0];
      }

      // Handle img - parseBody with {all: true} should return array if multiple files
      let imgFiles = body["img"];
      // Validate required fields
      if (!title) {
        return c.json({ error: "Missing required field: title" }, 400);
      }

      let imgMainUrl = "";
      let imgUrls: string[] = [];

      // Upload imgMain (required)
      if (imgMainFile && imgMainFile instanceof File) {
        const arrayBuffer = await imgMainFile.arrayBuffer();
        const result = await uploadToCloudinary(
          arrayBuffer,
          "portfolio/projects"
        );
        imgMainUrl = result.secureUrl;
      } else {
        return c.json({ error: "imgMain file is required" }, 400);
      }

      // Upload img array (optional, multiple images)
      if (imgFiles) {
        // Handle both single file and multiple files
        const fileArray = Array.isArray(imgFiles) ? imgFiles : [imgFiles];

        for (const file of fileArray) {
          if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await uploadToCloudinary(
              arrayBuffer,
              "portfolio/projects"
            );
            imgUrls.push(result.secureUrl);
          }
        }
      }

      // Create project in database
      const project = await db.project.create({
        data: {
          title,
          imgMain: imgMainUrl,
          img: JSON.stringify(imgUrls),
          url: url || null,
        },
      });

      return c.json(
        {
          success: true,
          message: "Project created successfully",
          data: {
            ...project,
            imgCount: imgUrls.length,
            imgArray: imgUrls,
          },
        },
        201
      );
    } catch (error) {
      return c.json(
        {
          error: "Failed to create project",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });

  // POST project with URL only (no file upload)
  app.post(`${ROUTE.API}${ROUTE.PROJECTS}/url`, async (c) => {
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

    return c.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      201
    );
  });
};
