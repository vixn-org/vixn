import mongoose, { Schema, type Document } from "mongoose";

export interface ISearchTag extends Document {
  tag: string;
  slug: string;
  customTitle?: string;
  customDescription?: string;
  active: boolean;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const SearchTagSchema = new Schema<ISearchTag>(
  {
    tag: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    customTitle: { type: String, default: "" },
    customDescription: { type: String, default: "" },
    active: { type: Boolean, default: true },
    clicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

SearchTagSchema.index({ slug: 1 }, { unique: true });
SearchTagSchema.index({ active: 1, createdAt: -1 });
SearchTagSchema.index({ tag: "text" });

const SearchTag = mongoose.models.SearchTag || mongoose.model<ISearchTag>("SearchTag", SearchTagSchema);

export default SearchTag;
