import express from "express";
import { addFood, listFood, removeFood, editFood } from "../controllers/foodController.js";
import multer from "multer";

const foodRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .toLowerCase();
    return cb(null, `${Date.now()}_${sanitizedName}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({ success: false, message: "File too large. Maximum size is 5MB." });
    }
    return res.json({ success: false, message: `Upload error: ${error.message}` });
  }
  if (error) return res.json({ success: false, message: error.message });
  next();
};

foodRouter.post("/add",    upload.single("image"), handleUploadError, addFood)
foodRouter.get("/list",    listFood)
foodRouter.post("/remove", removeFood)
foodRouter.post("/edit",   upload.single("image"), handleUploadError, editFood)

// ── NEW: Edit route — image is optional (upload.single still runs but file may be absent)
foodRouter.post("/edit", upload.single("image"), handleUploadError, editFood);

export default foodRouter;