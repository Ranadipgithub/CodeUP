const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageId, submitBatch, submitToken } = require("../utils/problemUtility");

const submitCode = async (req, res) => {
    try{
        const userId = req.user._id;
        console.log(userId);
        const problemId = req.params.id;
        
        const {code, language} = req.body;
        
        if(!userId || !problemId || !code || !language){
            return  res.status(400).json({ error: "Missing required fields" });
        }

        // fetch the problem from database
        const problem = await Problem.findById(problemId);
        
        if(!problem){
            return res.status(404).json({ error: "Problem not found" });
        }

        // create a new submission entry in database with status "pending"
        const submittedResult = await Submission.create({
            userId, 
            problemId,
            code,
            language: language.toLowerCase(),
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length,
        });


        // Submit the code to judge0
        const languageId = getLanguageId(language);
        const submissions = problem.hiddenTestCases.map((testCase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((item) => item.token).join(",");

        const testResult = await submitToken(resultToken);

        // update the submission entry in database
        let testCasesPassed = 0;
        let runtime = 0, memory = 0;
        let status = 'accepted';
        let errorMessage = null;
        for(const test of testResult){
            if(test.status.id === 3){
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                if(test.status.id ==4){
                    status = "wrong answer";
                    errorMessage = test.stderr;
                } else {
                    status = test.status.description;
                    errorMessage = test.stderr;
                }
            }
        }
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage || "";
        await submittedResult.save();

        await User.findByIdAndUpdate(userId, { $addToSet: { problemSolved: problemId } }).exec();

        res.status(200).json({ submittedResult });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error " + error.message });
    }
}

const runCode = async (req, res) => {
    try{
        const userId = req.user._id;
        console.log(userId);
        const problemId = req.params.id;
        
        const {code, language} = req.body;
        
        if(!userId || !problemId || !code || !language){
            return  res.status(400).json({ error: "Missing required fields" });
        }

        // fetch the problem from database
        const problem = await Problem.findById(problemId);
        
        if(!problem){
            return res.status(404).json({ error: "Problem not found" });
        }

        // Submit the code to judge0
        const languageId = getLanguageId(language);
        const submissions = problem.visibleTestCases.map((testCase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((item) => item.token).join(",");

        const testResult = await submitToken(resultToken);

        res.status(200).json(testResult);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error " + error.message });
    }
}

// get submissions of a problem by user
const getSubmissionByUser = async (req, res) => {
    try{
        const userId = req.user._id;
        const problemId = req.params.id;
        const submissions = await Submission.find({ userId, problemId });
        if(submissions.length === 0){
            return res.status(404).json({ error: "No submissions found for this problem by the user" });
        }
        res.status(200).json({ submissions });
    } catch(err){
        res.status(400).json({error: err.message});
    }
}

module.exports = { submitCode, runCode };