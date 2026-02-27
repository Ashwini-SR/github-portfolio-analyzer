const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();   // ✅ Correct place

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

console.log("Token loaded:", GITHUB_TOKEN ? "YES" : "NO");

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
};

app.get("/analyze/:username", async (req, res) => {
  const username = req.params.username;

  try {
    // 1️⃣ Get User Info
    const userRes = await axios.get(
      `https://api.github.com/users/${username}`,
      { headers }
    );

    // 2️⃣ Get Repositories
    const repoRes = await axios.get(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      { headers }
    );

    const repos = repoRes.data;

    let totalStars = 0;
    let topRepo = null;
    let languageCount = {};

    repos.forEach((repo) => {
      totalStars += repo.stargazers_count;

      if (!topRepo || repo.stargazers_count > topRepo.stars) {
        topRepo = {
          name: repo.name,
          stars: repo.stargazers_count,
        };
      }

      if (repo.language) {
        languageCount[repo.language] =
          (languageCount[repo.language] || 0) + 1;
      }
    });

    // Convert language count to percentages
    const languagePercentages = {};
    const totalLanguages = Object.values(languageCount).reduce(
      (a, b) => a + b,
      0
    );

    for (let lang in languageCount) {
      languagePercentages[lang] = Math.round(
        (languageCount[lang] / totalLanguages) * 100
      );
    }

    // 3️⃣ Calculate Score
    let score = 0;

    if (repos.length >= 10) score += 20;
    else score += repos.length * 2;

    if (userRes.data.followers >= 10) score += 15;
    else score += userRes.data.followers;

    score += Math.min(totalStars, 20);

    if (Object.keys(languageCount).length >= 3) score += 15;

    if (userRes.data.bio) score += 10;
    if (userRes.data.blog) score += 5;
    if (userRes.data.public_gists > 0) score += 5;

    if (score > 100) score = 100;

    // 4️⃣ Recommendations
    let recommendations = [];
    let redFlags = [];

    if (repos.length < 5)
      recommendations.push("Create more public repositories.");
    if (totalStars < 5)
      recommendations.push("Work on projects that attract stars.");
    if (!userRes.data.bio)
      recommendations.push("Add a bio to your profile.");
    if (Object.keys(languageCount).length < 2)
      recommendations.push("Use multiple programming languages.");

    if (repos.length === 0)
      redFlags.push("No public repositories.");
    if (userRes.data.followers === 0)
      redFlags.push("No followers yet.");
    if (!userRes.data.bio)
      redFlags.push("Profile bio missing.");

    // 5️⃣ Final Response
    res.json({
      username: userRes.data.login,
      avatar: userRes.data.avatar_url,
      profileUrl: userRes.data.html_url,
      score,
      totalStars,
      topRepo: topRepo ? topRepo.name : null,
      languagePercentages,
      breakdown: {
        repositories: repos.length,
        followers: userRes.data.followers,
        documentation: userRes.data.bio ? "Yes" : "No",
        activity: userRes.data.public_gists,
        languages: Object.keys(languageCount).length,
        stars: totalStars,
        profile: userRes.data.blog ? "Complete" : "Incomplete",
      },
      recommendations,
      redFlags,
    });
  } catch (error) {
    console.log("GitHub API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "User not found or API error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});