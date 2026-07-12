// routes/stats.js
const express = require("express");
const router = express.Router();
const AccessLog = require("../models/AccessLog");

router.get("/lock-usage", async (req, res) => {
  try {
    const lockUsage = await AccessLog.aggregate([
      { $match: { action: "unlock", status: "success" } },
      { $group: { _id: "$doorId", unlocks: { $sum: 1 } } },
      { 
        $lookup: { 
          from: "doors",        // collection name is lowercase+plural in Mongo, not "Door"
          localField: "_id", 
          foreignField: "_id", 
          as: "door" 
        } 
      },
      { $unwind: "$door" },
      { $project: { lockName: "$door.location", unlocks: 1, _id: 0 } },
      { $sort: { unlocks: -1 } }
    ]);

    res.json(lockUsage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;