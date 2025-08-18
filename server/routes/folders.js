const express = require("express");
const Folder = require("../models/Folder");
const Image = require("../models/Image");
const auth = require("../middleware/auth");
const { deleteFromCloudinary } = require("../config/cloudinary");

const router = express.Router();

// Get all folders for current user
router.get("/", auth, async (req, res) => {
  try {
    const { parent } = req.query;
    const query = {
      owner: req.user._id,
      parent: parent === "root" ? null : parent || null,
    };

    const folders = await Folder.find(query)
      .sort({ name: 1 })
      .populate("parent", "name");

    res.json(folders);
  } catch (error) {
    console.error("Get folders error:", error);
    res.status(500).json({ message: "Server error while fetching folders" });
  }
});

// Get folder tree
router.get("/tree", auth, async (req, res) => {
  try {
    const folders = await Folder.find({ owner: req.user._id })
      .sort({ path: 1 })
      .select("name parent path");

    // Build tree structure
    const folderMap = new Map();
    const rootFolders = [];

    folders.forEach((folder) => {
      folderMap.set(folder._id.toString(), {
        ...folder.toObject(),
        children: [],
      });
    });

    folders.forEach((folder) => {
      const folderData = folderMap.get(folder._id.toString());
      if (folder.parent) {
        const parent = folderMap.get(folder.parent.toString());
        if (parent) {
          parent.children.push(folderData);
        }
      } else {
        rootFolders.push(folderData);
      }
    });

    res.json(rootFolders);
  } catch (error) {
    console.error("Get folder tree error:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching folder tree" });
  }
});

// Create folder
router.post("/", auth, async (req, res) => {
  try {
    const { name, parent } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const existingFolder = await Folder.findOne({
      owner: req.user._id,
      name: name.trim(),
      parent: parent || null,
    });

    if (existingFolder) {
      return res
        .status(400)
        .json({ message: "Folder with this name already exists" });
    }

    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        owner: req.user._id,
      });

      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
    }

    const folder = new Folder({
      name: name.trim(),
      owner: req.user._id,
      parent: parent || null,
    });

    await folder.save();
    await folder.populate("parent", "name");

    res.status(201).json(folder);
  } catch (error) {
    console.error("Create folder error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: "Server error while creating folder" });
  }
});

// Update folder name
router.put("/:id", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const existingFolder = await Folder.findOne({
      owner: req.user._id,
      name: name.trim(),
      parent: folder.parent,
      _id: { $ne: folder._id },
    });

    if (existingFolder) {
      return res
        .status(400)
        .json({ message: "Folder with this name already exists" });
    }

    folder.name = name.trim();
    await folder.save();
    await folder.populate("parent", "name");

    res.json(folder);
  } catch (error) {
    console.error("Update folder error:", error);
    res.status(500).json({ message: "Server error while updating folder" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const descendantFolders = await getDescendantFolders(
      folder._id,
      req.user._id
    );
    const folderIds = [folder._id, ...descendantFolders.map((f) => f._id)];

    const images = await Image.find({ folder: { $in: folderIds } });

    const deletePromises = images.map((image) =>
      deleteFromCloudinary(image.cloudinaryPublicId).catch((err) =>
        console.error("Failed to delete from Cloudinary:", err)
      )
    );

    await Promise.allSettled(deletePromises);

    await Image.deleteMany({ folder: { $in: folderIds } });

    await Folder.deleteMany({ _id: { $in: folderIds } });

    res.json({ message: "Folder and all contents deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ message: "Server error while deleting folder" });
  }
});

// Helper function to get all descendant folders
async function getDescendantFolders(parentId, userId) {
  const directChildren = await Folder.find({ parent: parentId, owner: userId });
  let allDescendants = [...directChildren];

  for (const child of directChildren) {
    const descendants = await getDescendantFolders(child._id, userId);
    allDescendants = [...allDescendants, ...descendants];
  }

  return allDescendants;
}

module.exports = router;
