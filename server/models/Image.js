import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true }, 
    public_id: { type: String, required: true }, 
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", ImageSchema);
