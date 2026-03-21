import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadImage(
  file: File,
  folder: string,
): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `metermate/${folder}`,
            transformation: [
              { quality: "auto", fetch_format: "auto" },
              { width: 1200, crop: "limit" },
            ],
          },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
          },
        )
        .end(buffer);
    });
  } catch {
    return null;
  }
}
