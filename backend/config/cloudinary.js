import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bridgeher-videos",
    resource_type: "video",
    allowed_formats: ["mp4", "webm", "mov", "avi"],
    transformation: [{ quality: "auto" }],
  },
});

const pdfStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "bridgeher-pdfs",
    resource_type: "raw",
    allowed_formats: ["pdf"],
  },
});

export { cloudinary, videoStorage, pdfStorage };