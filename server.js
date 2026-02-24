const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/analyze/:username", async (req, res) => {
    const username = req.params.username;

    try {
        // Fetch user and repositories
        const userRes = await axios.get(`https://api.github.com/users/${username}`);
        const repoRes = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`);

        const user = userRes.data;
        const repos = repoRes.data;

        let score = 0;
        let redFlags = [];
        let strengths = [];

        const publicRepos = user.public_repos;
        const followers = user.followers;

        // --------------------------
        // 1️⃣ Repository Count (20)
        // --------------------------
        if (publicRepos >= 20) {
            score += 20;
            strengths.push("Strong repository presence");
        } else if (publicRepos >= 10) {
            score += 15;
        } else if (publicRepos >= 5) {
            score += 8;
        } else {
            redFlags.push("Very few public repositories");
        }

        // --------------------------
        // 2️⃣ Followers (15)
        // --------------------------
        if (followers >= 500) {
            score += 15;
            strengths.push("Strong community recognition");
        } else if (followers >= 100) {
            score += 10;
        } else if (followers >= 10) {
            score += 5;
        } else {
            redFlags.push("Low community presence");
        }

        // --------------------------
        // 3️⃣ Documentation Quality (15)
        // --------------------------
        const reposWithDesc = repos.filter(r => r.description && r.description.trim() !== "").length;
        const docRatio = publicRepos ? reposWithDesc / publicRepos : 0;

        if (docRatio >= 0.7) {
            score += 15;
            strengths.push("Good documentation coverage");
        } else if (docRatio >= 0.4) {
            score += 8;
        } else {
            redFlags.push("Many repositories lack proper descriptions");
        }

        // --------------------------
        // 4️⃣ Activity Consistency (20)
        // --------------------------
        const recentRepos = repos.filter(r => {
            const updated = new Date(r.updated_at);
            const now = new Date();
            const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
            return diffDays < 90;
        });

        if (recentRepos.length >= 5) {
            score += 20;
            strengths.push("Highly active in last 3 months");
        } else if (recentRepos.length >= 2) {
            score += 10;
        } else {
            redFlags.push("Low recent activity (last 3 months)");
        }

        // --------------------------
        // 5️⃣ Language Diversity (15)
        // --------------------------
        const languages = new Set();
        repos.forEach(r => {
            if (r.language) languages.add(r.language);
        });

        if (languages.size >= 5) {
            score += 15;
            strengths.push("Strong technology diversity");
        } else if (languages.size >= 3) {
            score += 10;
        } else if (languages.size >= 1) {
            score += 5;
        } else {
            redFlags.push("Limited technology stack");
        }

        // --------------------------
        // 6️⃣ Profile Completeness (15)
        // --------------------------
        if (user.bio && user.bio.trim() !== "") {
            score += 5;
        } else {
            redFlags.push("No bio added");
        }

        if (user.blog) score += 5;
        if (user.company) score += 5;

        // Clamp score to 100
        score = Math.min(score, 100);

        res.json({
            username: user.login,
            avatar: user.avatar_url,
            profileUrl: user.html_url,
            repos: publicRepos,
            followers: followers,
            score,
            strengths: strengths.length ? strengths : ["Growing profile"],
            redFlags: redFlags.length ? redFlags : ["No major red flags"],
            languages: Array.from(languages)
        });

    } catch (error) {
        res.status(500).json({ error: "User not found" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});