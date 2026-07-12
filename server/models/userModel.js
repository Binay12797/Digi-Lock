const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fingerprintId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ["Admin", "Employee", "Security"], default: "Employee" },
  isActive: { type: Boolean, default: true }
}, {
  collection: 'users',
  versionKey: false
});

module.exports = mongoose.model("User", userSchema);