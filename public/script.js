document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("githubForm");
    const resultDiv = document.getElementById("result");
    const loadingText = document.getElementById("loading");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const usernameInput = document.getElementById("githubUrl").value.trim();

        if (!usernameInput) {
            alert("Please enter a GitHub username");
            return;
        }

        // Extract username if full URL is pasted
        let username = usernameInput;
        if (username.includes("github.com")) {
            const parts = username.split("/");
            username = parts[parts.length - 1] || parts[parts.length - 2];
        }

        resultDiv.style.display = "none";
        loadingText.style.display = "block";

        try {
            const response = await fetch(`/analyze/${username}`);

            if (!response.ok) {
                throw new Error("User not found or server error");
            }

            const data = await response.json();

            loadingText.style.display = "none";
            resultDiv.style.display = "block";

            const scorePercentage = data.score;

            resultDiv.innerHTML = `
                <div class="profile-header">
                    <img src="${data.avatar}" class="avatar" alt="Avatar">
                    <div class="profile-info">
                        <h2>${data.username}</h2>
                        <a href="${data.profileUrl}" target="_blank" class="github-btn">
                            View GitHub Profile
                        </a>
                    </div>
                </div>

                <div class="score-section">
                    <div class="score">${data.score}/100</div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scorePercentage}%"></div>
                    </div>
                </div>

                <p><strong>Public Repositories:</strong> ${data.repos}</p>
                <p><strong>Followers:</strong> ${data.followers}</p>

                <div class="strengths">
                    <h4>Strengths</h4>
                    <ul>
                        ${data.strengths.map(s => `<li>${s}</li>`).join("")}
                    </ul>
                </div>

                <div class="redflags">
                    <h4>Red Flags</h4>
                    <ul>
                        ${data.redFlags.map(r => `<li>${r}</li>`).join("")}
                    </ul>
                </div>

                <div style="margin-top:15px;">
                    <strong>Languages Used:</strong>
                    <p>${data.languages.length ? data.languages.join(", ") : "Not enough data"}</p>
                </div>
            `;

        } catch (error) {
            loadingText.style.display = "none";
            resultDiv.style.display = "block";

            resultDiv.innerHTML = `
                <div class="redflags">
                    <h4>Error</h4>
                    <p>${error.message}</p>
                </div>
            `;
        }
    });

});