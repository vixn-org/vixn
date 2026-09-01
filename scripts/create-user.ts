import * as fs from "fs";
import * as path from "path";
import * as readline from "readline/promises";
import mongoose from "mongoose";
import { hashPassword } from "../lib/password";
import User, { type UserRole } from "../lib/models/user";

// Load .env.local or .env if present
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let value = trimmed.substring(eqIdx + 1).trim();
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.substring(1, value.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

async function main() {
  loadEnv();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error(
      "❌ Error: MONGODB_URI is not defined in your environment or .env.local"
    );
    process.exit(1);
  }

  console.log("\n============================================");
  console.log("   VIXN User Creation / Management CLI");
  console.log("============================================\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    // Optional positional CLI arguments: npx tsx scripts/create-user.ts <email> <password> <role> <name>
    const args = process.argv.slice(2);
    let email = args[0];
    let password = args[1];
    let role = args[2] as UserRole;
    let name = args[3];

    if (!email) {
      email = await rl.question("Enter user email: ");
    }
    email = email.trim().toLowerCase();

    if (!email) {
      console.error("❌ Email cannot be empty.");
      process.exit(1);
    }

    if (!password) {
      password = await rl.question("Enter security password: ");
    }
    password = password.trim();

    if (!password || password.length < 4) {
      console.error("❌ Password must be at least 4 characters.");
      process.exit(1);
    }

    if (!role) {
      const roleChoice = await rl.question(
        "Enter role (admin / subadmin) [default: subadmin]: "
      );
      const cleaned = roleChoice.trim().toLowerCase();
      role = cleaned === "admin" ? "admin" : "subadmin";
    }

    if (!["admin", "subadmin"].includes(role)) {
      console.log(`⚠️ Invalid role "${role}". Defaulting to "subadmin".`);
      role = "subadmin";
    }

    if (!name) {
      const nameInput = await rl.question(
        `Enter display name [default: ${role === "admin" ? "Admin" : "Subadmin"}]: `
      );
      name = nameInput.trim() || (role === "admin" ? "Admin" : "Subadmin");
    }

    console.log(`\nConnecting to MongoDB...`);
    await mongoose.connect(mongoUri);

    console.log(`Hashing password...`);
    const hashedPassword = await hashPassword(password);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.role = role;
      existingUser.name = name;
      await existingUser.save();
      console.log(`\n✅ Successfully updated existing user:`);
    } else {
      const newUser = await User.create({
        email,
        password: hashedPassword,
        role,
        name,
      });
      console.log(`\n✅ Successfully created new user:`);
    }

    console.log(`--------------------------------------------`);
    console.log(`📧 Email:    ${email}`);
    console.log(`👤 Name:     ${name}`);
    console.log(`🛡️ Role:     ${role.toUpperCase()}`);
    console.log(`--------------------------------------------\n`);
  } catch (err: any) {
    console.error("❌ Failed to create user:", err.message || err);
  } finally {
    rl.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
