import { Schema, model, models, Types } from "mongoose";

const ImageSchema = new Schema(
  {
    title: { type: String },
    description: { type: String },
    slug: { type: String, required: true, unique: true },
    objectKey: { type: String, required: true }, // path/key inside MinIO bucket
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sizeBytes: { type: Number },
    blurhash: { type: String },
    location: { type: String },
    cameraInfo: { type: String }, // e.g. "Leica Q2 · 28mm · f/1.7"
    capturedAt: { type: Date },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    category: { type: Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

ImageSchema.index({ category: 1, order: 1 });

export default models.Image || model("Image", ImageSchema);
