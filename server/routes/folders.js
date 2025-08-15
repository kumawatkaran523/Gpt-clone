import express from "express";
import auth from "../middleware/auth.middleware.js";
// import Folder from "../models/Folder.js";

const router = express.Router();

// Create folder
router.post("/", auth, async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = new Folder({
      name,
      parent: parentId || null,
      owner: req.user._id,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get folder structure
router.get("/", auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
