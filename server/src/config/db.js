const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is missing in .env file");
        }

        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
        
    } catch (error) {
        console.error("Database connection error:", error);
    }
}

module.exports = main;