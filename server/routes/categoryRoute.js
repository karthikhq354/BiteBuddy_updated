import express from "express";
import multer from "multer";
import path from "path";
import { listCategories, listAllCategories, addCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

categoryRouter.get("/list",          listCategories);
categoryRouter.get("/all",           listAllCategories);
categoryRouter.post("/add",          upload.single("image"), addCategory);
categoryRouter.put("/update/:id",    upload.single("image"), updateCategory);
categoryRouter.delete("/delete/:id", deleteCategory);

export default categoryRouter;