const mongoose = require("mongoose");
const AccessLogSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    authType:{
        type: String,
        enum:["fingerprint","pin"],
        required: true
    },
    status:{
        type: String,
        enum:["GRANTED","DENIED"],
        required: true
    },
    scannedDataString:{
        type: String,
        required: true

    }
},{
    timestamps: true
});

module.exports = mongoose.model("accessLog", AccessLogSchema)