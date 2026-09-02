import mongoose, { Schema, type Document } from "mongoose";

export interface IMediaItem {
  _id?: string;
  type: "photo" | "video";
  url: string;
  thumbnail?: string;
  title: string;
  alt: string;
  keywords?: string[];
  order: number;
  isExternal?: boolean;
}

export interface ISubPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  heading?: string;
  introText?: string;
}

export interface IModel extends Document {
  name: string;
  slug: string;

  // Main Page SEO Fields
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robotsDirective: string;
  focusKeyphrase: string;
  cornerstone: boolean;

  // Sub-Pages Specific SEO
  photosSeo?: ISubPageSeo;
  videosSeo?: ISubPageSeo;

  // Content
  bio: string;
  aboutContent?: string;
  profileImage: string;
  coverImage: string;

  // Media
  media: IMediaItem[];

  // Categorization
  tags: string[];
  category: string;
  country?: string;

  // Status
  status: "draft" | "published";
  featured: boolean;
  reviewed: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    type: {
      type: String,
      enum: ["photo", "video"],
      required: true,
    },
    url: { type: String, required: true },
    thumbnail: { type: String, default: "" },
    title: { type: String, default: "" },
    alt: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isExternal: { type: Boolean, default: false },
  },
  { _id: true }
);

const SubPageSeoSchema = new Schema<ISubPageSeo>(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: [String], default: [] },
    heading: { type: String, default: "" },
    introText: { type: String, default: "" },
  },
  { _id: false }
);

const ModelSchema = new Schema<IModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Main SEO
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    twitterTitle: { type: String, default: "" },
    twitterDescription: { type: String, default: "" },
    twitterImage: { type: String, default: "" },
    robotsDirective: { type: String, default: "index, follow" },
    focusKeyphrase: { type: String, default: "" },
    cornerstone: { type: Boolean, default: false },

    // Sub-Pages Specific SEO
    photosSeo: { type: SubPageSeoSchema, default: () => ({}) },
    videosSeo: { type: SubPageSeoSchema, default: () => ({}) },

    // Content
    bio: { type: String, default: "" },
    aboutContent: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    coverImage: { type: String, default: "" },

    // Media
    media: { type: [MediaItemSchema], default: [] },

    // Categorization
    tags: { type: [String], default: [] },
    category: { type: String, default: "" },
    country: { type: String, default: "" },

    // Status
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    featured: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
ModelSchema.index({ status: 1, createdAt: -1 });
ModelSchema.index({ status: 1, name: 1 });
ModelSchema.index({ status: 1, category: 1 });
ModelSchema.index({ status: 1, tags: 1 });

// Text index for search
ModelSchema.index({ name: "text", metaTitle: "text", metaDescription: "text", tags: "text" });

const Model = mongoose.models.Model || mongoose.model<IModel>("Model", ModelSchema);

export default Model;
