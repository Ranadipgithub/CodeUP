const Problem = require("../models/problem");
const SolutionVideo = require("../models/solutionVideo");
const Submission = require("../models/submission");
const User = require("../models/user");

const getAllUsers = async (req, res) => {
  try {
    const response = await User.find({});
    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await Submission.deleteMany({ userId });
    await Problem.updateMany(
      { problemCreator: userId },
      { problemCreator: "69308f9e6ba12958264697c3" }
    );

    await SolutionVideo.deleteMany({ userId });
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAllUsers, deleteUser };
