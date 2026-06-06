const mongoose = require('mongoose');

const doorSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['locked', 'unlocked'],
    default: 'locked'
  },

  authorizedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  lastAccessedAt: {
    type: Date,
    default: null
  }, 
},
{
   versionKey : false
  });

module.exports = mongoose.model('Door', doorSchema,'door');