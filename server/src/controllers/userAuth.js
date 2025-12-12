const redisClient = require("../config/redis");
const Submission = require("../models/submission");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 3600000, // 1 hour
};


const register = async (req, res) => {
    try{
        validate(req.body);

        const {firstName, lastName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'user';

        const user = await User.create(req.body);

        const token = jwt.sign({_id: user._id, role: user.role, emailId:emailId}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, cookieOptions);

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role,
            _id: user._id
        }

        res.status(201).json({
            message: "User registered successfully",
            user: reply
        });
    } catch(err) {
        res.status(400).json({error: err.message});
    }
};

const login = async (req, res) => {
    try{
        const {emailId, password} = req.body;
        if(!emailId || !password) {
            throw new Error("Invalid credentials");
        }
        console.log(emailId, password);
        const user =  await User.findOne({emailId});
        if(!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token = jwt.sign({_id: user._id, emailId:emailId, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, cookieOptions);

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            role: user.role,
            _id: user._id
        }

        res.status(200).json({
            message: "User logged in successfully",
            user: reply
        })
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error("User not logged in");

    const payload = jwt.decode(token);

    await redisClient.set(`token:${token}`, "blocked");
    await redisClient.expireAt(`token:${token}`, payload.exp);

    res.cookie("token", "", {
      ...cookieOptions,
      expires: new Date(0)
    });

    res.status(200).json({ message: "User logged out successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


const adminRegister = async (req, res) => {
    try{
        validate(req.body);

        const {firstName, lastName, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password, 10);
        req.body.role = 'admin';

        const user = await User.create(req.body);

        const token = jwt.sign({_id: user._id, role: user.role, emailId:emailId}, process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, cookieOptions);

        res.status(201).send({message: "User registered successfully"});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

const deleteProfile = async (req, res) => {
    try{
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        // delete all submissions
        await Submission.deleteMany({userId});
        res.cookie('token', null, {...cookieOptions, expires: new Date(0)});
        res.status(200).json({message: "User profile deleted successfully"});
    } catch(err) {
        res.status(400).json({error: err.message});
    }
}

module.exports = { register, login, logout, adminRegister, deleteProfile };