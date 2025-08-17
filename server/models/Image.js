const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Image name is required"],
      trim: true,
      maxlength: [100, "Image name cannot exceed 100 characters"],
    },
    cloudinaryUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      required: [true, "Images must be in a folder"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better query performance
imageSchema.index({ owner: 1, folder: 1 });
imageSchema.index({ owner: 1, name: "text" });

module.exports = mongoose.model("Image", imageSchema);
