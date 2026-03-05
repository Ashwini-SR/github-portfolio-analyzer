document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("githubForm");
    const resultDiv = document.getElementById("result");
    const inputField = document.getElementById("githubUrl");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = inputField.value.trim();

        if (!username) {
            resultDiv.style.display = "block";
            resultDiv.innerHTML = "<p class='red-flag'>Please enter a username</p>";
            return;
        }

        resultDiv.style.display = "block";
        resultDiv.innerHTML = "Analyzing profile...";

        try {
            const response = await fetch(`/analyze/${username}`);
            const data = await response.json();

            if (!response.ok) {
                resultDiv.innerHTML = `<p class="red-flag">${data.error}</p>`;
                return;
            }

            let scoreColor = "#dc3545";
            if (data.score >= 70) scoreColor = "#28a745";
            else if (data.score >= 40) scoreColor = "#ffc107";

            let languageHTML = "";
            for (let lang in data.languagePercentages) {
                languageHTML += `
                    <p>${lang} - ${data.languagePercentages[lang]}%</p>
                    <div class="score-bar">
                        <div class="score-fill" style="width:${data.languagePercentages[lang]}%; background:${scoreColor}"></div>
                    </div>
                `;
            }

            let breakdownHTML = `
                <table class="breakdown-table">
                    <tr><td>Repositories</td><td>${data.breakdown.repositories}</td></tr>
                    <tr><td>Followers</td><td>${data.breakdown.followers}</td></tr>
                    <tr><td>Documentation</td><td>${data.breakdown.documentation}</td></tr>
                    <tr><td>Activity</td><td>${data.breakdown.activity}</td></tr>
                    <tr><td>Languages</td><td>${data.breakdown.languages}</td></tr>
                    <tr><td>Stars</td><td>${data.breakdown.stars}</td></tr>
                    <tr><td>Profile</td><td>${data.breakdown.profile}</td></tr>
                </table>
            `;

            resultDiv.innerHTML = `
                <div class="profile-section">
                    <img src="${data.avatar}" class="avatar">
                    <h3>${data.username}</h3>
                    <a href="${data.profileUrl}" target="_blank" class="github-btn">
                        View GitHub Profile
                    </a>
                </div>

                <h3>Overall Score: ${data.score}/100</h3>
                <div class="score-bar">
                    <div class="score-fill" style="width:${data.score}%; background:${scoreColor}"></div>
                </div>

                <h3>Performance Breakdown</h3>
                ${breakdownHTML}

                <h3>Language Distribution</h3>
                ${languageHTML}

                <h3>Total Stars: ⭐ ${data.totalStars}</h3>
                <p>Top Repository: ${data.topRepo || "N/A"}</p>

                <h3>Recommendations</h3>
                <ul>
                    ${data.recommendations.map(r => `<li>${r}</li>`).join("")}
                </ul>

                <h3>Red Flags</h3>
                <ul>
                    ${data.redFlags.map(r => `<li class="red-flag">${r}</li>`).join("")}
                </ul>
            `;

        } catch (error) {
    console.error("Frontend Error:", error);

    resultDiv.innerHTML =
        "<p class='red-flag'>Server error. Please try again.</p>";
}

    });

});