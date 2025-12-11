const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const User = require("../models/user");

// only admin can register new admins 
const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("No token provided");
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = payload;

        if (!_id) {
            throw new Error("Invalid token");
        }

        // Fetch user
        const result = await User.findById(_id);
        if (!result) {
            throw new Error("User not found");
        }

        if(payload.role !== 'admin') {
            throw new Error("Access denied. Admins only.");
        }

        // Check blocklist
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            throw new Error("Token is blocked. Please login again.");
        }

        req.result = result;
        next();
    } catch (err) {
        return res.status(401).json({ error: err.message || "Unauthorized" });
    }
};

module.exports = adminMiddleware;