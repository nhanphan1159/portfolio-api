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

      // Determine content type and parse accordingly
      const contentType = c.req.header("content-type") || "";
      let title: string;
      let url: string;
      let imgMainFile: unknown;
      let imgFiles: unknown;
      let task: string;

      if (contentType.includes("application/json")) {
        // Handle JSON request (base64 data URLs or direct URLs)
        const jsonBody = await c.req.json();
        title = jsonBody.title;
        url = jsonBody.url;
        imgMainFile = jsonBody.imgMain;
        imgFiles = jsonBody.img;
      } else {
        // Parse multipart form data - parseBody has limitations with multiple files
        const body = await c.req.parseBody({ all: true });

        title = body["title"] as string;
        url = body["url"] as string;

        // Handle imgMain - can be single value or array (take first if array)
        imgMainFile = body["imgMain"];
        if (Array.isArray(imgMainFile)) {
          imgMainFile = imgMainFile[0];
        }

        // Handle img - parseBody with {all: true} should return array if multiple files
        imgFiles = body["img"];
      }
      // Validate required fields

      let imgMainUrl = "";
      let imgUrls: string[] = [];

      // Upload imgMain (required) - supports both File and base64 data URL
      if (imgMainFile && imgMainFile instanceof File) {
        const arrayBuffer = await imgMainFile.arrayBuffer();
        const result = await uploadToCloudinary(
          arrayBuffer,
          "portfolio/projects"
        );
        imgMainUrl = result.secureUrl;
      } else if (
        typeof imgMainFile === "string" &&
        imgMainFile.startsWith("data:")
      ) {
        // Handle base64 data URL
        const base64Data = imgMainFile.split(",")[1];
        const buffer = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );
        const result = await uploadToCloudinary(
          buffer.buffer,
          "portfolio/projects"
        );
        imgMainUrl = result.secureUrl;
      } else if (
        typeof imgMainFile === "string" &&
        imgMainFile.startsWith("http")
      ) {
        // Already a URL, use directly
        imgMainUrl = imgMainFile;
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
          } else if (typeof file === "string" && file.startsWith("data:")) {
            // Handle base64 data URL
            const base64Data = file.split(",")[1];
            const buffer = Uint8Array.from(atob(base64Data), (c) =>
              c.charCodeAt(0)
            );
            const result = await uploadToCloudinary(
              buffer.buffer,
              "portfolio/projects"
            );
            imgUrls.push(result.secureUrl);
          } else if (typeof file === "string" && file.startsWith("http")) {
            // Already a URL, use directly
            imgUrls.push(file);
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
    if (!title || !imgMain) {
      return c.json({ error: "Missing required fields: title, imgMain" }, 400);
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
