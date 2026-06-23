const mongoose = require("mongoose");

const lockSchema = new mongoose.Schema({
    deviceId: {type: String, required: true, unique: true},
    name: {type: String, default: "Main Entrance Gate"},
    status:{type: String, enum:["LOCKED", "UNLOCKED"], default:"LOCKED"},
    lastUpdated:{type: Date, default: Date.now}

},{timestamps: true});

module.exports = mongoose.model("Lock",lockSchema);