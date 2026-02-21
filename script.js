// Select form and result div
const form = document.getElementById("githubForm");
const githubUrlInput = document.getElementById("githubUrl");
const resultDiv = document.getElementById("result");

// Listen for form submission
form.addEventListener("submit", function(e) {
    e.preventDefault(); // Prevent page reload

    const url = githubUrlInput.value.trim();

    if (url === "") {
        resultDiv.innerHTML = "<p style='color:red;'>Please enter a GitHub URL.</p>";
        return;
    }

    // Display placeholder result
    resultDiv.innerHTML = `
        <p>Analyzing: <strong>${url}</strong></p>
        <p>Score: <strong>--/100</strong></p>
        <p>Strengths: --</p>
        <p>Red Flags: --</p>
        <p>Suggestions: --</p>
    `;
});