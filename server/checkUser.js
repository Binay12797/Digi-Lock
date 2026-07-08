require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const User = require("../Database/models/User").default;

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ username: "testuser" });
  console.log("Full document as Mongoose sees it:");
  console.log(user);

  process.exit(0);
}

checkUser();