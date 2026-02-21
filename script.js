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

    // Dummy data (replace later with real API)
    const totalRepos = 8;  // pretend this user has 8 repos
    const reposWithDescription = 5; // 5 repos have descriptions

    const score = Math.min(100, Math.round((reposWithDescription / totalRepos) * 50 + Math.min(totalRepos, 10) * 5));

    let strengths = [];
    let redFlags = [];
    if (reposWithDescription / totalRepos > 0.5) strengths.push("Good documentation coverage");
    else redFlags.push("Many repos missing descriptions");

    if (totalRepos >= 5) strengths.push("Active contributor");
    else redFlags.push("Few public repositories");

    resultDiv.innerHTML = `
        <h3>${username}</h3>
        <p><strong>Public Repositories:</strong> ${totalRepos}</p>
        <p><strong>Repositories with Description:</strong> ${reposWithDescription}</p>
        <p><strong>GitHub Portfolio Score:</strong> ${score}/100</p>
        <p><strong>Strengths:</strong> ${strengths.length ? strengths.join(", ") : "--"}</p>
        <p><strong>Red Flags:</strong> ${redFlags.length ? redFlags.join(", ") : "--"}</p>
        <p><strong>Suggestions:</strong> Improve repo descriptions, add meaningful commits, maintain consistency.</p>
    `;
});