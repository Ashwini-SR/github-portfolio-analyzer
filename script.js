const form = document.getElementById("githubForm");
const githubUrlInput = document.getElementById("githubUrl");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const username = githubUrlInput.value.trim();
    if (!username) {
        resultDiv.innerHTML = "<p style='color:red;'>Please enter your GitHub username.</p>";
        return;
    }

    resultDiv.innerHTML = "<p>Analyzing profile...</p>";

    // Dummy Data (MVP)
    const totalRepos = 8;
    const reposWithDescription = 5;
    const activeCommits = 12;
    const languageCount = 3;

    // Scoring Logic
    let score = 0;

    if (totalRepos >= 10) score += 20;
    else score += totalRepos * 2;

    score += Math.round((reposWithDescription / totalRepos) * 30);
    score += Math.min(activeCommits, 20);
    score += Math.min(languageCount * 3, 10);

    score = Math.min(100, score);

    // Strengths & Red Flags
    let strengths = [];
    let redFlags = [];

    if (reposWithDescription / totalRepos > 0.6)
        strengths.push("Good documentation coverage");
    else
        redFlags.push("Many repos missing descriptions");

    if (totalRepos >= 5)
        strengths.push("Active contributor");
    else
        redFlags.push("Few public repositories");

    if (activeCommits >= 10)
        strengths.push("Regular commit activity");
    else
        redFlags.push("Low commit frequency");

    if (languageCount > 1)
        strengths.push("Diverse language usage");
    else
        redFlags.push("Limited technology stack");

    // Generate Strengths HTML
    let strengthsHTML = strengths.map(item =>
        `<li class="strength">✔ ${item}</li>`
    ).join("");

    let redFlagsHTML = redFlags.map(item =>
        `<li class="red-flag">✖ ${item}</li>`
    ).join("");

    // Display Result
    resultDiv.innerHTML = `
        <h3>${username}</h3>

        <p><strong>Portfolio Score: ${score}/100</strong></p>
        <div class="score-bar">
            <div class="score-fill" style="width:${score}%"></div>
        </div>

        <p><strong>Public Repos:</strong> ${totalRepos}</p>
        <p><strong>Repos with Description:</strong> ${reposWithDescription}</p>
        <p><strong>Commits:</strong> ${activeCommits}</p>
        <p><strong>Languages Used:</strong> ${languageCount}</p>

        <h4>Strengths</h4>
        <ul>${strengthsHTML}</ul>

        <h4>Red Flags</h4>
        <ul>${redFlagsHTML}</ul>

        <h4>Suggestions</h4>
        <p>Improve README files, maintain consistent commits, diversify tech stack, and highlight impactful projects.</p>
    `;
});