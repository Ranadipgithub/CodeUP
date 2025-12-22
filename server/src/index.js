const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const redisClient = require("./config/redis");
require("./config/passport");

app.use(cors({
  origin: ["http://localhost:5173", "https://codeupp.vercel.app"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

// routes
app.use("/user", require("./routes/userAuth"));
app.use("/problem", require("./routes/problemCreator"));
app.use("/submission", require("./routes/submit"));
app.use('/ai', require('./routes/chatAI'));
app.use('/video', require('./routes/videoCreator'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/authRoute'));

app.get('/ping', (req, res) => {
  res.send('server is awake');
})

const initializeConnection = async () => {
  try {
    await main();               // mongo connect
    await redisClient.connect(); // redis connect

    console.log("Connected to MongoDB and Redis successfully");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });

  } catch (err) {
    console.error("Error initializing connections:", err);
  }
};

initializeConnection();