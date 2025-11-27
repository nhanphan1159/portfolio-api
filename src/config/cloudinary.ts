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
/**
 * Upload via Cloudinary REST API (more compatible with Workers)
 */
export const uploadToCloudinary = async (
  file: Buffer | string | ArrayBuffer | Uint8Array,
  folder: string = "portfolio"
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  try {
    const config = cloudinary.config();

    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error("Cloudinary not configured");
    }

    let base64String: string;

    // Convert different types to base64
    if (typeof file === "string") {
      base64String = file.startsWith("data:")
        ? file
        : `data:image/png;base64,${file}`;
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

    // Generate timestamp and signature for authentication
    const timestamp = Math.floor(Date.now() / 1000);
    const crypto = await import("crypto");

    // Prepare upload parameters
    const uploadParams: Record<string, string> = {
      folder,
      timestamp: timestamp.toString(),
      upload_preset: "",
    };

    // Generate signature
    const stringToSign =
      Object.keys(uploadParams)
        .filter((key) => uploadParams[key])
        .sort()
        .map((key) => `${key}=${uploadParams[key]}`)
        .join("&") + config.api_secret;

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    // Upload using REST API
    const formData = new FormData();
    formData.append("file", base64String);
    formData.append("folder", folder);
    formData.append("timestamp", timestamp.toString());
    formData.append("api_key", config.api_key);
    formData.append("signature", signature);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Cloudinary API error: ${response.status} - ${errorText}`
      );
    }

    const result = (await response.json()) as any;

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
