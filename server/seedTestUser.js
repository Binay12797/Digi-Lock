require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const User = require("../Database/models/User").default;

async function seedUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Check if it already exists to avoid duplicate key errors on re-run
    const existing = await User.findOne({ fingerprintId: "test123" });
    if (existing) {
      console.log("Test user already exists:", existing._id);
      process.exit(0);
    }

    const newUser = await User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: "temporarypassword", 
      fingerprintId: "test123",
      isActive: true
    });

    console.log("Test user created:", newUser._id);
    console.log("fingerprintId:", newUser.fingerprintId);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding user:", err.message);
    process.exit(1);
  }
}

seedUser();