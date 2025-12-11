const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    language: {
      type: String,
      enum: ["c++", "java", "python", "javascript"],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
        enum: ["pending", "accepted", "wrong answer", "runtime error", "time limit exceeded", "compilation error"],
      required: true,
    },
    runtime: {
      type: Number, // in milliseconds
      default: 0,
    },
    memory: {
      type: Number, // in KB
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    testCasesTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 1: ascending order
// -1: descending order
// userId will be in ascending order and according to a given userId, problemId will be in ascending order
submissionSchema.index({ userId: 1, problemId: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;