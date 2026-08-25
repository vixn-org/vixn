import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAuthor {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;

  category: string;
  tags: string[];
  author: IAuthor;
  readingTime: number; // in minutes

  // Status & Visibility
  status: "draft" | "published";
  featured: boolean;
  publishedAt?: Date;

  // SEO Fields
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

  // Programmatic Internal Linking
  relatedModelSlugs: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, default: "VIXN Editorial" },
    role: { type: String, default: "Senior Content Editor" },
    avatar: { type: String, default: "/logo.jpg" },
    bio: { type: String, default: "" },
  },
  { _id: false }
);

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      default: "",
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    coverImageAlt: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Guides",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: AuthorSchema,
      default: () => ({}),
    },
    readingTime: {
      type: Number,
      default: 3,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },

    // SEO Strategy
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

    // Internal Link Graph
    relatedModelSlugs: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Search indexing on title, excerpt, content and tags
BlogPostSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  tags: "text",
});

const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

export default BlogPost;
