import { v2 as cloudinary } from "cloudinary";

export const configureCloudinary = (env?: {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}) => {
  const config = {
    cloud_name: env?.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    api_key: env?.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY,
    api_secret: env?.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET,
    secure: true,
  };

  // Validate credentials
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error(
      "Missing Cloudinary credentials. Please check your .env file."
    );
  }

  cloudinary.config(config);
  return cloudinary;
};

/**
 * Upload image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder name in Cloudinary (default: 'portfolio')
 * @returns Cloudinary upload result with URL
 */
export const uploadToCloudinary = async (
  file: Buffer | string | ArrayBuffer | Uint8Array,
  folder: string = "portfolio"
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  try {
    let base64String: string;
    
    // Convert different types to base64
    if (typeof file === "string") {
      base64String = file;
    } else if (Buffer.isBuffer(file)) {
      base64String = `data:image/png;base64,${file.toString("base64")}`;
    } else if (file instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(file);
      const buffer = Buffer.from(uint8Array);
      base64String = `data:image/png;base64,${buffer.toString("base64")}`;
    } else if (file instanceof Uint8Array) {
      const buffer = Buffer.from(file);
      base64String = `data:image/png;base64,${buffer.toString("base64")}`;
    } else {
      throw new Error("Unsupported file type");
    }

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: "auto",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    
    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    // Log detailed error for debugging
    console.error("Cloudinary upload error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      hasCloudinaryConfig: !!cloudinary.config().cloud_name
    });
    
    // Return more specific error message
    if (error instanceof Error) {
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
    throw new Error("Failed to upload image to Cloudinary");
  }
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Failed to delete image from Cloudinary");
  }
};
