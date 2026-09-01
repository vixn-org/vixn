import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "admin" | "subadmin";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    name: {
      type: String,
      default: "User",
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "subadmin"],
      default: "subadmin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent recompilation in Next.js hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
