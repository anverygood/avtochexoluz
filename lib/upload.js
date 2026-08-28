const multer = require("multer");
const path = require("path");

function makeUploader(subfolder, allowedExt) {
  const allowed = allowedExt || [".jpg", ".jpeg", ".png", ".webp"];

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "public", "uploads", subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, safeName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 40 * 1024 * 1024 }, // 40MB (video uchun ham yetadi)
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowed.includes(ext)) {
        return cb(new Error(`Ruxsat etilgan formatlar: ${allowed.join(", ")}`));
      }
      cb(null, true);
    },
  });
}

module.exports = { makeUploader };
