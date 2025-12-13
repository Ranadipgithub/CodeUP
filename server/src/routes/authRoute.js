const express = require("express");
const passpost = require("passport");
const jwt = require("jsonwebtoken");
const userMiddleware = require("../middleware/userMiddleware");

const router = express.Router();

// step-1: redirect to google
router.get(
  "/google",
  passpost.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passpost.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    try {
      const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.cookie("token", token, { httpOnly: true });
      res.redirect(`${process.env.CLIENT_URL}/auth-success`);
    } catch (error) {
      console.log(error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_failed`);
    }
  }
);

router.get('/me', userMiddleware, (req, res) => {
    res.json({success: true, user: req.user});
});

module.exports = router;