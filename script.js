const form = document.getElementById("githubForm");
const githubUrlInput = document.getElementById("githubUrl");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent page reload

    const username = githubUrlInput.value.trim(); // Get input
    if (!username) {
        resultDiv.innerHTML = "<p style='color:red;'>Please enter your GitHub username.</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Analyzing profile...</p>"; // Show temporary message


    const totalRepos = 8;             // Total public repositories
    const reposWithDescription = 5;   // Repos with README / description
    const activeCommits = 12;         // Number of commits (dummy)
    const languageCount = 3;          // Different programming languages used

    // ---------------------------
    // Scoring Logic
    // ---------------------------
    let score = 0;

    // Repo count score (max 20 points)
    if (totalRepos >= 10) score += 20;
    else score += totalRepos * 2;

    // Description / README score (max 30 points)
    score += Math.round((reposWithDescription / totalRepos) * 30);

    // Commit activity score (max 20 points)
    score += Math.min(activeCommits, 20);

    // Language diversity score (max 10 points)
    score += Math.min(languageCount * 3, 10);

    // Clamp total score to 100
    score = Math.min(100, score);

    // ---------------------------
    // Determine Strengths & Red Flags
    // ---------------------------
    let strengths = [];
    let redFlags = [];

    // Documentation / README
    if (reposWithDescription / totalRepos > 0.6) strengths.push("Good documentation coverage");
    else redFlags.push("Many repos missing descriptions");

    // Repository count
    if (totalRepos >= 5) strengths.push("Active contributor");
    else redFlags.push("Few public repositories");

    // Commit activity
    if (activeCommits >= 10) strengths.push("Regular commit activity");
    else redFlags.push("Low commit frequency");

    // Language diversity
    if (languageCount > 1) strengths.push("Diverse language usage");
    else redFlags.push("Limited technology stack");

    // ---------------------------
    // Display Results
    // ---------------------------
    resultDiv.innerHTML = `
        <h3>${username}</h3>
        <p><strong>Portfolio Score:</strong> ${score}/100</p>
        <p><strong>Public Repos:</strong> ${totalRepos}</p>
        <p><strong>Repos with Description:</strong> ${reposWithDescription}</p>
        <p><strong>Commits:</strong> ${activeCommits}</p>
        <p><strong>Languages:</strong> ${languageCount}</p>
        <p><strong>Strengths:</strong> ${strengths.join(", ")}</p>
        <p><strong>Red Flags:</strong> ${redFlags.join(", ")}</p>
        <p><strong>Suggestions:</strong> Improve repo descriptions, maintain commit consistency, diversify projects, and highlight impactful repos.</p>
    `;
});