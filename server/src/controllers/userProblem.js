const redisClient = require("../config/redis");
const Problem = require("../models/problem");
const SolutionVideo = require("../models/solutionVideo");
const Submission = require("../models/submission");
const User = require("../models/user");
const {
  getLanguageId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  try {
    for (const element of referenceSolution) {
      const { language, completeCode } = element;

      const languageId = getLanguageId(language);

      // creating batch submissions for all visible test cases
      // console.log(visibleTestCases);
      // It is an array of objects containing input, output, source_code, language_id
      const submissions = visibleTestCases.map((testCase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      // submitResult is a token of all submissions
      const submitResult = await submitBatch(submissions);

      // console.log(submitResult);
      // we have to again send a GET request to get the results using the token
      // while doing batch submission, we have to send those tokens in the form of a string separated by comma
      // e.g., "token1,token2,token3,..."
      const resultToken = submitResult.map((item) => item.token).join(",");

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status.id !== 3) {
          return res.status(400).json({
            error:
              "Reference solution failed on some visible test cases. Please check the reference solution.",
          });
        }
      }
    }
    // if all reference solutions pass the visible test cases, create the problem
    await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    await redisClient.del("all_problems");
    res.status(201).json({ message: "Problem created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    for (const element of referenceSolution) {
      const { language, completeCode } = element;

      const languageId = getLanguageId(language);

      // creating batch submissions for all visible test cases
      // console.log(visibleTestCases);
      // It is an array of objects containing input, output, source_code, language_id
      const submissions = visibleTestCases.map((testCase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      // submitResult is a token of all submissions
      const submitResult = await submitBatch(submissions);

      // console.log(submitResult);
      // we have to again send a GET request to get the results using the token
      // while doing batch submission, we have to send those tokens in the form of a string separated by comma
      // e.g., "token1,token2,token3,..."
      const resultToken = submitResult.map((item) => item.token).join(",");

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status.id !== 3) {
          return res.status(400).json({
            error:
              "Reference solution failed on some visible test cases. Please check the reference solution.",
          });
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    await redisClient.del("all_problems");
    await redisClient.del(`problem:${id}`);

    res
      .status(200)
      .json({
        message: "Problem updated successfully",
        problem: updatedProblem,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProblemByIdAllInfo = async (req, res) => {
  const { id } = req.params;
  try {
    if(!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.status(200).json({ problem });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if(!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }
    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    await redisClient.del("all_problems");
    await redisClient.del(`problem:${id}`);
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

const getProblemById = async (req, res) => {
  const { id } = req.params;
  const REDIS_KEY = `problem:${id}`;
  try {
    if (!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }

    // Fetch problem from redis if exists
    const problemFromRedis = await redisClient.get(REDIS_KEY);
    if(problemFromRedis) {
      console.log("Cache hit problem id");
      return res.status(200).json({ problem: JSON.parse(problemFromRedis) });
    }

    console.log("Cache miss problem id");

    // 1. Fetch Problem as a Plain Object (.lean())
    // We remove .toObject() later because .lean() already gives us a JS object
    const problem = await Problem.findById(id)
      .select('_id title description difficulty tags visibleTestCases startCode referenceSolution')
      .lean();

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Store problem in redis
    await redisClient.set(REDIS_KEY, JSON.stringify(problem));

    // 2. Fetch Video
    // const videos = await SolutionVideo.findOne({ problemId: id }).lean();

    // // 3. Attach video info if it exists
    // if (videos) {
    //   problem.secureUrl = videos.secureUrl;
    //   problem.duration = videos.duration;
    //   problem.thumbnailUrl = videos.thumbnailUrl;
    // }

    // 4. Send Response
    // We wrap it in { problem } to maintain consistency for the frontend
    return res.status(200).json({ problem });

  } catch (error) {
    console.error("GetProblem Error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const getAllProblem = async (req, res) => {
  const cache_key = "all_problems";
  try {
    const cachedProblems = await redisClient.get(cache_key);
    if(cachedProblems) {
      console.log("Cache hit");
      return res.status(200).json({problems: JSON.parse(cachedProblems)});
    }

    console.log("Cache miss");

    const problems = await Problem.find({}).select('_id title difficulty tags');
    if (problems.length === 0) {
      return res.status(404).json({ error: "No problems found" });
    }

    await redisClient.set(cache_key, JSON.stringify(problems), 'EX', 60 * 60); // 1 hour
    res.status(200).json({problems});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Pagination
// localhost:3000/problem/getAllProblems?page=2&limit=10
// const getProblem = await Problem.find().skip((page - 1) * limit).limit(limit);


// Filter
// localhost:3000/problem/getAllProblems?difficulty=easy&tags=arrays&tags=strings
// await Problem.find({ difficulty: 'easy', tags: { $in: ['arrays', 'strings'] } });

const getsolvedProblemsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path:"problemSolved",
      select: "_id title difficulty tags"
    });
    res.status(200).json( user.problemSolved );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submittedProblems = async (req, res) => {
  try{
    const userId = req.user._id;
    const problemId = req.params.pid;
    const submissions = await Submission.find({ userId, problemId });
    if(submissions.length === 0){
      return res.status(404).json({ error: "No submissions found for this problem by the user" });
    }
    res.status(200).json({ submissions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  getsolvedProblemsByUser,
  submittedProblems,
  getProblemByIdAllInfo
};