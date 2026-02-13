const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/analyze", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: "Username required" });
  }

  try {
    // Fetch user data
    const userResponse = await axios.get(
      `https://api.github.com/users/${username}`
    );

    // Fetch repositories
    const repoResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    const repos = repoResponse.data;

    // -----------------------------
    // SCORING LOGIC
    // -----------------------------

    let documentationScore = 0;
    let activityScore = 0;
    let depthScore = 0;
    let repoStrengthScore = 0;
    let impactScore = 0;

    // 1️⃣ Documentation Score (20)
    repos.forEach(repo => {
      if (repo.description && repo.description.length > 10) {
        documentationScore += 2;
      }
    });
    documentationScore = Math.min(documentationScore, 20);

    // 2️⃣ Activity Score (20)
    const recentRepos = repos.filter(repo => {
      const updated = new Date(repo.updated_at);
      const now = new Date();
      const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
      return diffDays < 30;
    });
    activityScore = Math.min(recentRepos.length * 4, 20);

    // 3️⃣ Technical Depth Score (20)
    const languages = new Set(
      repos.map(repo => repo.language).filter(Boolean)
    );
    depthScore = Math.min(languages.size * 5, 20);

    // 4️⃣ Repository Strength Score (20)
    repoStrengthScore = Math.min(repos.length * 2, 20);

    // 5️⃣ Impact Score (20)
    if (repos.some(repo => repo.stargazers_count > 10)) {
      impactScore = 20;
    } else if (repos.some(repo => repo.stargazers_count > 0)) {
      impactScore = 10;
    } else {
      impactScore = 5;
    }

    const totalScore =
      documentationScore +
      activityScore +
      depthScore +
      repoStrengthScore +
      impactScore;

    // -----------------------------
    // SUGGESTIONS
    // -----------------------------

    let suggestions = [];

    if (documentationScore < 10)
      suggestions.push(
        "Improve README files and add detailed project descriptions."
      );

    if (activityScore < 10)
      suggestions.push(
        "Increase commit consistency and update repositories regularly."
      );

    if (depthScore < 10)
      suggestions.push(
        "Use more diverse technologies to demonstrate technical depth."
      );

    if (repoStrengthScore < 10)
      suggestions.push(
        "Create more high-quality public repositories to strengthen your portfolio."
      );

    if (impactScore < 10)
      suggestions.push(
        "Work on projects that attract stars or contribute to open source for visibility."
      );

    // -----------------------------
    // RED FLAGS
    // -----------------------------

    let redFlags = [];

    if (repos.length < 3)
      redFlags.push("Very few public repositories.");

    if (activityScore < 8)
      redFlags.push("Low recent activity detected.");

    if (!repos.some(repo => repo.stargazers_count > 0))
      redFlags.push("No repository has stars — low community engagement.");

    res.json({
      totalScore,
      documentationScore,
      activityScore,
      depthScore,
      repoStrengthScore,
      impactScore,
      totalRepos: repos.length,
      suggestions,
      redFlags
    });

  } catch (error) {
    res.status(500).json({ error: "Invalid GitHub username" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
