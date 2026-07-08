require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const User = require("../Database/models/User").default;

async function fixUser() {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await User.updateOne(
    { fingerprintId: "test123" },
    { $set: { isActive: true } }
  );

  console.log("Update result:", result);

  const updated = await User.findOne({ fingerprintId: "test123" });
  console.log("Updated document:", updated);

  process.exit(0);
}

fixUser();