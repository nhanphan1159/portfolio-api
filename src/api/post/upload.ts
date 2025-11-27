import { Hono } from "hono";
import { ROUTE } from "../../constants/common";
import {
  configureCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary";

export const postUpload = (app: Hono<{ Bindings: IBindings }>) => {
  app.post(`${ROUTE.API}/upload`, async (c) => {
    try {
      // Configure Cloudinary with environment variables
      configureCloudinary(c.env);

      // Get the uploaded file from form data
      const body = await c.req.parseBody();
      const file = body["file"];

      if (!file) {
        return c.json({ error: "No file uploaded" }, 400);
      }

      // Check if file is a File object
      if (!(file instanceof File)) {
        return c.json({ error: "Invalid file format" }, 400);
      }

      // Validate file type (images only)
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        return c.json(
          {
            error:
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
          },
          400
        );
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return c.json(
          {
            error: "File size too large. Maximum size is 5MB",
          },
          400
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Get folder name from query params (optional)
      const folder = c.req.query("folder") || "portfolio";

      // Upload to Cloudinary
      const result = await uploadToCloudinary(buffer, folder);

      return c.json(
        {
          success: true,
          message: "Image uploaded successfully",
          data: {
            url: result.secureUrl,
            publicId: result.publicId,
          },
        },
        200
      );
    } catch (error) {
      console.error("Upload error:", error);
      return c.json(
        {
          error: "Failed to upload image",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });

  // Upload multiple images
  app.post(`${ROUTE.API}/upload/multiple`, async (c) => {
    try {
      configureCloudinary(c.env);

      const body = await c.req.parseBody();
      const files = body["files"];

      if (!files) {
        return c.json({ error: "No files uploaded" }, 400);
      }

      // Handle single file or array of files
      const fileArray = Array.isArray(files) ? files : [files];

      // Filter and validate files
      const validFiles = fileArray.filter((file) => file instanceof File);

      if (validFiles.length === 0) {
        return c.json({ error: "No valid files found" }, 400);
      }

      // Upload all files
      const folder = c.req.query("folder") || "portfolio";
      const uploadPromises = validFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return uploadToCloudinary(buffer, folder);
      });

      const results = await Promise.all(uploadPromises);

      return c.json(
        {
          success: true,
          message: `${results.length} image(s) uploaded successfully`,
          data: results.map((r) => ({
            url: r.secureUrl,
            publicId: r.publicId,
          })),
        },
        200
      );
    } catch (error) {
      return c.json(
        {
          error: "Failed to upload images",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      );
    }
  });
};
