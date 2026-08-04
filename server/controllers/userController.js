require("dotenv").config();
const User = require("../models/userModel");
const enrollmentState = require("../services/enrollmentState");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const addUser = require("../models/addUserModel");


async function createUser(req,res){
    try{
        const{name, email, password, fingerprint} = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All input fields are required." });
        }

        // Check if user already exists in DB
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email configuration already registered." });
        }

        const encrypt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, encrypt);
        const newUser = new User({
            name: name,
            email : email,
            password :hashedPassword,
            fingerprint: fingerprint}

        );
        await newUser.save();
        console.log("user created");
        return res.status(201).json({
            success: true,
            message: "user created",
            user: newUser
        });

    }catch(err){
        console.log("error caught:",err);
        return res.status(400).json({
            success: false, error: err.message
        });

    }
};

// async function signUpPage(req,res){
//     res.render("sign-up");
// }

// async function loginPage(req,res){
//     res.json({
//         success: true,
//         message: "Digilock auth operational"
//     });
// };



async function login(req, res) {
   const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid  Password." });
        }
        const token = jwt.sign(
            {_id: user._id, email: user.email},
            process.env.JWT_SECRET,{
                expiresIn: process.env.JWT_EXPIRES
            }
        );
        
            return res.status(200).json({ 
                success: true, 
                message: "Logged in successfully!", 
                token: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isActive: user.isActive
                }
            });
        
    }catch(error){
        return res.status(500).json({success: false, error: error.message});
    }
};

async function startEnrollment(req,res){
    const{userId} = req.body;
    if(!userId){
        return res.status(400).json({success: false, meassage: "User Id is required to start enrollement"});

    }
    enrollmentState.setSession(userId);
    return res.status(200).json({
        success: true,
        message: `Enrollment session started for user ${userId}. Ready for fingerprint scan`
    });
};

async function getUserProfile(req,res){
    try{
        const user = await addUser.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({success: false, message: "User profile not found"});

        }
        return res.json({success: true, data: user});

    }catch(error){
        return res.status(500).json({success: false, error: error.message});

    }
}

async function userInfo(req,res){
    try {
    // Fetch all user records from your collection, sorted by newest first
    const users = await addUser.find({}).sort({ createdAt: -1 });
    //console.log(`[DB Debug] Found ${users.length} users in the database collection.`);
    
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve users from database." });
  }
}
module.exports={
    createUser,
    login,
    startEnrollment,
    getUserProfile,
    
    userInfo
}