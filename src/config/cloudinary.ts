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
  file: Buffer | string,
  folder: string = "portfolio"
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  try {
    const result = await cloudinary.uploader.upload(
      Buffer.isBuffer(file)
        ? `data:image/png;base64,${file.toString("base64")}`
        : file,
      {
        folder,
        resource_type: "auto",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }
    );
    return {
      url: result.url,
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
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
