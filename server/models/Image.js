import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", ImageSchema);
