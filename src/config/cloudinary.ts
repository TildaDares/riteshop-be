import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { createReadStream } from 'streamifier'

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

export const uploadFromBuffer = (
  image: Buffer,
  folder: string,
  { width, height }: { width: number; height: number | string }
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: `riteshop/${folder}`,
        transformation: { width, height, crop: "fill" },
        overwrite: true,
        invalidate: true,
      },
      (error: any, result: any) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    createReadStream(image).pipe(cld_upload_stream);
  });

};
