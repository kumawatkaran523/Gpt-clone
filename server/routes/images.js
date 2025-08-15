import express from "express";
import multer from "multer";
import Image from "../models/Image.js";
import auth from "../middleware/auth.middleware.js";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { name, folderId } = req.body;
    const image = new Image({
      name,
      path: req.file.path,
      folder: folderId || null,
      owner: req.user.id,
    });
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload image" });
  }
});

export default router;
