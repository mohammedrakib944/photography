import { Schema, model, models } from "mongoose";

const SiteSettingsSchema = new Schema({
  _id: { type: String, default: "singleton" },
  siteName: { type: String, required: true },
  logoObjectKey: { type: String }, // uploaded logo image (png/svg/jpg); falls back to siteName text when unset
  tagline: { type: String },
  bioText: { type: String },
  contactEmail: { type: String },
  socialLinks: { type: Schema.Types.Mixed }, // { instagram: "", twitter: "" ... }
});

export default models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
