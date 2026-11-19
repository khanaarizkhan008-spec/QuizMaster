const message = document.getElementById("message");
const quizSelect = document.getElementById("quiz-select");
const tableBody = document.getElementById("leaderboard-body");

let currentController = null;

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

async function loadLeaderboard() {
    if (currentController) {
        currentController.abort();
    }
    const controller = new AbortController();
    currentController = controller;

    tableBody.innerHTML = "";
    message.textContent = "";

    try {
        const response = await fetch("/api/quizzes/" + quizSelect.value + "/leaderboard", {
            signal: controller.signal,
        });
        if (!response.ok) {
            message.textContent = "Could not load the leaderboard.";
            return;
        }
        const attempts = await response.json();
        if (controller.signal.aborted) {
            return;
        }
        if (attempts.length === 0) {
            message.textContent = "No attempts yet for this quiz.";
        }
        attempts.forEach(function (attempt, index) {
            const row = document.createElement("tr");
            addCell(row, index + 1);
            addCell(row, attempt.player_name);
            addCell(row, attempt.score + " / " + attempt.total_questions);
            addCell(row, attempt.time_taken_seconds);
            tableBody.appendChild(row);
        });
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }
        message.textContent = "Could not load the leaderboard.";
    }
}

async function loadQuizzes() {
    const response = await fetch("/api/quizzes");
    const quizzes = await response.json();
    if (quizzes.length === 0) {
        message.textContent = "No quizzes yet.";
        return;
    }
    quizzes.forEach(function (quiz) {
        const option = document.createElement("option");
        option.value = quiz.id;
        option.textContent = quiz.title;
        quizSelect.appendChild(option);
    });

    // The result page links here with ?quiz=<id>
    const wantedId = new URLSearchParams(window.location.search).get("quiz");
    if (wantedId) {
        quizSelect.value = wantedId;
    }
    loadLeaderboard();
}

quizSelect.addEventListener("change", loadLeaderboard);

loadQuizzes();
