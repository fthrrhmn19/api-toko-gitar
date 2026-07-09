const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'toko-gitar', // Cloudinary folder name
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20000000
  }
});

const cekNull = (fileUpload) => {
  if (fileUpload === undefined || fileUpload === null || fileUpload.length === 0) {
    return null
  }
  // Cloudinary returns the full secure URL in the 'path' property
  return fileUpload[0].path
}

module.exports = { upload, cekNull }