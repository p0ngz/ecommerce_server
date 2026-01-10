const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUploader = (dirName, typeFile, limitSize) => {
  // console.log(dirName, typeFile, limitSize);
  // setting directory
  const uploadDirPath = path.join(
    __dirname,
    "..",
    "public",
    "uploads",
    dirName
  );
  if (!fs.existsSync(uploadDirPath)) {
    fs.mkdirSync(uploadDirPath, { recursive: true });
  }

  //   setting storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDirPath);
    },
    filename: (req, file, cb) => {
      const originalName = file.originalname.split(".")[0];
      const extName = path.extname(file.originalname);
      const fileName = `${originalName}_${Date.now()}_${extName}`;
      cb(null, fileName);
    },
  });

  //   setting file filter
  const fileFilter = (req, file, cb) => {
    const allowedType = typeFile ? typeFile : /jpeg|jpg|png|webp|gif/;
    const extName = path
      .extname(file.originalname)
      .toLowerCase()
      .match(allowedType);
    const mimeType = file.mimetype.match(allowedType);

    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb(new Error("File type is not allowed"));
    }
  };

  return multer({
    storage,
    limits: { fileSize: limitSize * 1024 * 1024 },
    fileFilter,
  });
};

module.exports = { createUploader };
