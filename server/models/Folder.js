const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      maxlength: [100, "Folder name cannot exceed 100 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    path: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
folderSchema.index({ owner: 1, parent: 1 });
folderSchema.index({ owner: 1, name: 1, parent: 1 }, { unique: true });

folderSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("parent") || this.isModified("name")) {
    try {
      if (this.parent) {
        const parentFolder = await this.constructor.findById(this.parent);
        if (parentFolder) {
          this.path = parentFolder.path
            ? `${parentFolder.path}/${this.name}`
            : this.name;
        }
      } else {
        this.path = this.name;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Folder", folderSchema);
