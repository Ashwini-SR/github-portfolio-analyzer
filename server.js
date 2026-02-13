const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// Helper function to get GitHub user repos
async function getUserRepos(username) {
  const response = await fetch(`https://api.github.com/users/${username}/repos`);
  if (!response.ok) return null;
  return await response.json();
}

// Helper to calculate score
function calculateScores(repos) {
  let documentationScore = 0;
  let activityScore = 0;
  let depthScore = 0;
  let repoStrengthScore = 0;
  let impactScore = 0;

  if (!repos || repos.length === 0) {
    return { documentationScore, activityScore, depthScore, repoStrengthScore, impactScore };
  }

  repos.forEach((repo) => {
    // Documentation: README exists
    documentationScore += repo.has_wiki || repo.description ? 2 : 0;

    // Depth: language complexity & topics
    depthScore += repo.language ? 2 : 0;

    // Repo Strength: size, forks, stars
    repoStrengthScore += Math.min(repo.stargazers_count + repo.forks_count, 6);

    // Impact: presence of topics, visibility, description
    impactScore += repo.topics?.length ? 3 : 1;
  });

  // Activity: commits over all repos (simplified as number of repos with pushed_at within last year)
  const now = new Date();
  const activeRepos = repos.filter(r => r.pushed_at && (new Date(r.pushed_at) > new Date(now.setFullYear(now.getFullYear() - 1))));
  activityScore = Math.min(activeRepos.length * 2, 10);

  // Cap the scores to their max
  documentationScore = Math.min(documentationScore, 10);
  activityScore = Math.min(activityScore, 10);
  depthScore = Math.min(depthScore, 20);
  repoStrengthScore = Math.min(repoStrengthScore, 30);
  impactScore = Math.min(impactScore, 30);

  return { documentationScore, activityScore, depthScore, repoStrengthScore, impactScore };
}

// Dynamic red flags and suggestions
function generateFeedback(scores, repos) {
  const { documentationScore, activityScore, depthScore, repoStrengthScore, impactScore } = scores;
  const redFlags = [];
  const suggestions = [];

  if (!repos || repos.length === 0) {
    redFlags.push("No public repositories found");
    suggestions.push("Create at least one project repository to showcase your skills");
    return { redFlags, suggestions };
  }

  if (documentationScore < 5) redFlags.push("Documentation is weak");
  if (documentationScore < 5) suggestions.push("Improve README files with clear explanations");

  if (activityScore < 5) redFlags.push("Low activity consistency");
  if (activityScore < 5) suggestions.push("Commit regularly to show consistency");

  if (repoStrengthScore < 15) redFlags.push("Repositories have low technical depth or structure issues");
  if (repoStrengthScore < 15) suggestions.push("Refactor code for best practices and clarity");

  if (depthScore < 10) redFlags.push("Projects lack technical depth");
  if (depthScore < 10) suggestions.push("Add more challenging features or algorithms");

  if (impactScore < 15) redFlags.push("Projects lack real-world relevance");
  if (impactScore < 15) suggestions.push("Highlight real-world use cases or business impact");

  return { redFlags, suggestions };
}

app.get("/analyze", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.json({ error: "GitHub username is required" });

  const repos = await getUserRepos(username);
  if (repos === null) return res.json({ error: "GitHub user not found or API rate limit exceeded" });

  const scores = calculateScores(repos);
  const feedback = generateFeedback(scores, repos);

  const totalScore = scores.documentationScore + scores.activityScore + scores.depthScore + scores.repoStrengthScore + scores.impactScore;

  res.json({
    totalScore,
    ...scores,
    redFlags: feedback.redFlags,
    suggestions: feedback.suggestions
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
