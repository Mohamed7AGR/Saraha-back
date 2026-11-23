import multer from "multer";
import fs from "node:fs";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import { badRequestExeption } from "../utils/exeptions.js";

export let fileTypes = {
  image: ["image/jpeg", "image/png", "image/jpg"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/mpeg", "video/webm"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav"],
};

export const multerMiddleware = ({
  storageFolder = "images",
  types = fileTypes.image,
  maxSize = 5,
}) => {
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folderPath = "./uploads/" + storageFolder;
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      let ext = file.mimetype.split("/")[1];
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
    },
  });
  let fileFilter = async (req, file, cb) => {
    if (!types.includes(file.mimetype)) {
      return cb(new Error(req.t("not.allowed.file.type")), false);
    }
    cb(null, true);
  };
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 1024 * 1024 * maxSize,
    },
  });
};


export const processFiles = ({ types = fileTypes.image } = {}) => {
    return async (req, res, next) => {
      try {
        const files = req.files
        ? Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat()
        : req.file
          ? [req.file]
          : [];
  
        if (!files.length) {
          return badRequestExeption(req.t("user.image.required"));
        }
  
        for (const file of files) {
            const result = await checkFile(file);
          
            if (
              !result ||
              !types.includes(result.mime) ||
              file.mimetype !== result.mime
            ) {
              for (const f of files) {
                if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
              }
              return badRequestExeption(req.t("not.allowed.file.type"));
            }
          }
  
        next();
      } catch (error) {
        next(error);
      }
    };
  };
   
const checkFile = async (file, types) => {
  let result;
  if (file.buffer) {
    result = await fileTypeFromBuffer(file.buffer);
  } else {
    result = await fileTypeFromFile(file.path);
  }
  return result;
};

