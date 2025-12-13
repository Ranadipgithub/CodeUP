const passport = require("passport");
const User = require("../models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://codeup-g1u4.onrender.com/auth/google/callback"
          : "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            emailId: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: "user",
            authProvider: "google",
          });
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);
