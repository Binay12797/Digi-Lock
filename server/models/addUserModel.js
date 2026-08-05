const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true, // Prevents duplicate email registrations
      lowercase: true,
      trim: true,
      
    },
    relation: {
      type: String,
      required: [true, "Relation/Position is required."],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, "Contact number is required."],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
    },
    fingerprint: {
      type: String,
      required: [true, "Fingerprint ID is required."],
      unique: true, // Ensures one physical biometric profile per user
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

// Export the model
const addUser = mongoose.model("addUser", userSchema);
module.exports = addUser;