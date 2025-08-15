import express from "express";
import auth from "../middleware/auth.middleware.js";
import Folder from "../models/Folder.js";

const router = express.Router();

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
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id });
    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id, 
    });
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Rename folder
router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name },
      { new: true } 
    );
    if (!folder) return res.status(404).json({ message: "Folder not found" });
    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete folder (and its contents recursively)
router.delete("/:id", auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!folder) return res.status(404).json({ message: "Folder not found" });

    // Recursively delete subfolders and their contents
    await deleteFolderRecursive(req.params.id);
    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const deleteFolderRecursive = async (folderId) => {
  // 1. Delete all subfolders
  const subfolders = await Folder.find({ parent: folderId });
  for (const subfolder of subfolders) {
    await deleteFolderRecursive(subfolder._id);
  }

  // 2. Delete all files in this folder (we'll implement this later)
  // await Image.deleteMany({ folder: folderId });

  // 3. Delete the folder itself
  await Folder.deleteOne({ _id: folderId });
};

export default router;
