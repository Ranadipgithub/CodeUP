const express = require("express");
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile } = require("../controllers/userAuth");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply = {
        firstName: req.user.firstName,
        emailId: req.user.emailId,
        _id: req.user._id,
        role: req.user.role,
        avatar: req.user.avatar
    }
    res.status(200).json({ message: "User is authenticated", user: reply });
});
// authRouter.get("/getProfile", getProfile);

module.exports = authRouter;