const axios = require("axios");

const getLanguageId = (lang) => {
  const language = {
    "c++": 54,
    "java": 62,
    "python": 71,
    "javascript": 63,
  };

  return language[lang.toLowerCase()] || null;
};

const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      base64_encoded: "false",
    },
    headers: {
      "x-rapidapi-key": "179b49dd99mshe9c7ff25d062582p170e75jsn0a7d707f4efe",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      "Content-Type": "application/json",
    },
    data: {
      submissions: submissions,
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  return await fetchData();
};

const waiting = async(timer) => {
  setTimeout(() => {return 1}, timer);
}

const submitToken = async (token) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    params: {
      tokens: token,
      base64_encoded: "false",
      fields: "*",
    },
    headers: {
      "x-rapidapi-key": "179b49dd99mshe9c7ff25d062582p170e75jsn0a7d707f4efe",
      "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
    },
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  while (true) {
    const result = await fetchData();
    // status code > 2 means the result is ready
    const isResultObtained = result.submissions.every((r) => r.status_id > 2);

    if (isResultObtained) {
      return result.submissions;
    }

    await waiting(1000);
  }
};

module.exports = {
  getLanguageId,
  submitBatch,
  submitToken,
};