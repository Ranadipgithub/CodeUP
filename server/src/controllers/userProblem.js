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

// Helper function to clear pagination cache
const clearPaginationCache = async () => {
  try {
    const keys = await redisClient.keys('problems_page_*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Pagination cache cleared");
    }
  } catch (error) {
    console.error("Error clearing pagination cache:", error);
  }
};

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

      const submissions = visibleTestCases.map((testCase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testCase.input,
        expected_output: testCase.output,
      }));

      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((item) => item.token).join(",");
      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status.id !== 3) {
          return res.status(400).json({
            error: "Reference solution failed on some visible test cases. Please check the reference solution.",
          });
        }
      }
    }

    const newProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    // INVALIDATE CACHE
    await redisClient.del("all_problems");
    await clearPaginationCache(); // Clears all pages so the new problem appears immediately

    res.status(201).json({ message: "Problem created successfully", problem: newProblem });
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

    // Validate reference solution if provided
    if (referenceSolution && referenceSolution.length > 0) {
      for (const element of referenceSolution) {
        const { language, completeCode } = element;
        const languageId = getLanguageId(language);

        const submissions = visibleTestCases.map((testCase) => ({
          source_code: completeCode,
          language_id: languageId,
          stdin: testCase.input,
          expected_output: testCase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((item) => item.token).join(",");
        const testResult = await submitToken(resultToken);

        for (const test of testResult) {
          if (test.status.id !== 3) {
            return res.status(400).json({
              error: "Reference solution failed on some visible test cases.",
            });
          }
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true }
    );

    // INVALIDATE CACHE
    await redisClient.del("all_problems");
    await redisClient.del(`problem:${id}`);
    await clearPaginationCache(); // Clear pagination cache on update

    res.status(200).json({
      message: "Problem updated successfully",
      problem: updatedProblem,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }
    const deletedProblem = await Problem.findByIdAndDelete(id);
    if (!deletedProblem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // INVALIDATE CACHE
    await redisClient.del("all_problems");
    await redisClient.del(`problem:${id}`);
    await clearPaginationCache(); // Clear pagination cache on delete

    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;
  const REDIS_KEY = `problem:${id}`;
  try {
    if (!id) {
      return res.status(400).json({ error: "Problem ID is required" });
    }

    // Fetch problem from redis if exists
    const problemFromRedis = await redisClient.get(REDIS_KEY);
    if (problemFromRedis) {
      console.log("Cache hit problem id");
      return res.status(200).json({ problem: JSON.parse(problemFromRedis) });
    }

    console.log("Cache miss problem id");

    const problem = await Problem.findById(id)
      .select('_id title description difficulty tags visibleTestCases startCode referenceSolution')
      .lean();

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Store problem in redis
    await redisClient.set(REDIS_KEY, JSON.stringify(problem), 'EX', 3600); // Expires in 1 hour

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
    if (cachedProblems) {
      console.log("Cache hit");
      return res.status(200).json({ problems: JSON.parse(cachedProblems) });
    }

    console.log("Cache miss");

    const problems = await Problem.find({}).select('_id title difficulty tags');
    if (problems.length === 0) {
      return res.status(404).json({ error: "No problems found" });
    }

    await redisClient.set(cache_key, JSON.stringify(problems), 'EX', 3600); // 1 hour
    res.status(200).json({ problems });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProblemsByPage = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  const cache_key = `problems_page_${pageNum}_limit_${limitNum}`;

  try {
    // Check Cache
    const cachedData = await redisClient.get(cache_key);
    if (cachedData) {
      console.log("Cache hit");
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("Cache miss");

    // Fetch Data & Count in parallel
    const [problems, total] = await Promise.all([
      Problem.find().skip((pageNum - 1) * limitNum).limit(limitNum),
      Problem.countDocuments()
    ]);

    if (problems.length === 0 && total > 0 && pageNum > 1) {
       // If page is empty but problems exist (e.g. user requested page 10 but we only have 5 pages)
       // You might optionally want to return empty array or 404. 
       // Currently standard behavior is returning empty array or 404 if truly no docs.
       return res.status(404).json({ error: "No problems found on this page" });
    }

    if (problems.length === 0 && total === 0) {
      return res.status(404).json({ error: "No problems found" });
    }

    const response = {
      problems,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      totalProblems: total
    };

    // Cache the full response
    await redisClient.setEx(cache_key, 3600, JSON.stringify(response));

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProblemByIdAllInfo = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
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
};

const getsolvedProblemsByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: "problemSolved",
      select: "_id title difficulty tags"
    });
    res.status(200).json(user.problemSolved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submittedProblems = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.pid;
    const submissions = await Submission.find({ userId, problemId });
    if (submissions.length === 0) {
      return res.status(404).json({ error: "No submissions found for this problem by the user" });
    }
    res.status(200).json({ submissions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  getsolvedProblemsByUser,
  submittedProblems,
  getProblemByIdAllInfo,
  getProblemsByPage,
};