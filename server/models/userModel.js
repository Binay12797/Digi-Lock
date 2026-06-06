const mongoose = require('mongoose');
const { useInsertionEffect } = require('react');

const user = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,

    },
    password: {
        type: String,
        required: true,
    
    }
},{
    
        timestamps: true
    
});

module.exports = mongoose.model('user', userSchema);

