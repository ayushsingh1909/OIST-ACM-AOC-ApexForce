import multer from "multer";
import { AppError } from "../utils/errors.js";

const memoryStorage = multer.memoryStorage();

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new AppError("Only PDF files are supported", 400), false);
  }
};

const generalFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
    "image/png",
    "image/jpeg",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Unsupported file type", 400), false);
  }
};

export const uploadResumePDF = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: pdfFilter,
});

export const uploadAssignmentFiles = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: generalFilter,
});
