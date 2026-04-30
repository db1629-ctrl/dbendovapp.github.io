// --- DOM Elements ---
// Grabbing all the HTML elements we need to update
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackExplanation = document.getElementById('feedback-explanation');
const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const progressBar = document.getElementById('progress-bar');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionTracker = document.getElementById('question-tracker');

// --- App State Variables ---
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = 0;

// --- 1. Load the Data ---
// This fetches your questions.json file
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        loadQuestion(); // Start the quiz once data is loaded
    })
    .catch(error => {
        questionText.innerText = "Error loading questions. Make sure you are running this on a server (like GitHub Pages) or a local development server, not just double-clicking the HTML file!";
        console.error("Error fetching questions:", error);
    });

// --- 2. Display a Question ---
function loadQuestion() {
    // Reset the UI for the new question
    nextBtn.classList.add('hidden');
    feedbackContainer.classList.add('hidden');
    optionsContainer.innerHTML = ''; // Clear old buttons

    const currentQuestion = questions[currentQuestionIndex];

    // Update Top Dashboard & Tracker
    questionTracker.innerText = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
    difficultyBadge.innerText = currentQuestion.difficulty;
    
    // Update Progress Bar
    const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Set the Question Text
    questionText.innerText = currentQuestion.question;

    // Create a button for each option
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        
        // Add a click listener to check the answer
        button.addEventListener('click', () => checkAnswer(index, button, currentQuestion));
        
        optionsContainer.appendChild(button);
    });
}

// --- 3. Handle Answer Checking & Gamification ---
function checkAnswer(selectedIndex, selectedButton, currentQuestion) {
    const isCorrect = selectedIndex === currentQuestion.correctAnswerIndex;
    const allButtons = document.querySelectorAll('.option-btn');

    // Disable all buttons so user can't click twice
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        // --- WIN STATE ---
        selectedButton.classList.add('correct');
        score += currentQuestion.points;
        streak += 1;
        
        feedbackTitle.innerText = "Correct! 🎉";
        feedbackTitle.style.color = "#28a745";

        // Confetti Logic!
        if (currentQuestion.difficulty === 'Hard' || streak >= 3) {
            // Big blast for hard questions or streaks
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
        } else {
            // Normal blast for regular correct answers
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }

    } else {
        // --- LOSE STATE ---
        selectedButton.classList.add('incorrect');
        streak = 0; // Reset streak
        
        // Highlight the actual correct answer so they learn
        allButtons[currentQuestion.correctAnswerIndex].classList.add('correct');
        
        feedbackTitle.innerText = "Incorrect.";
        feedbackTitle.style.color = "#dc3545";
    }

    // Update Dashboard Numbers
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;

    // Show the explanation
    feedbackExplanation.innerText = currentQuestion.explanation;
    feedbackContainer.classList.remove('hidden');

    // Show the Next button
    nextBtn.classList.remove('hidden');
}

// --- 4. Move to Next Question ---
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showEndScreen();
    }
});

// --- 5. End of Quiz ---
function showEndScreen() {
    progressBar.style.width = '100%';
    questionTracker.innerText = "Complete!";
    difficultyBadge.classList.add('hidden');
    
    questionText.innerText = `Quiz Complete! You scored ${score} points.`;
    optionsContainer.innerHTML = '';
    feedbackContainer.classList.add('hidden');
    nextBtn.classList.add('hidden');

    // Massive final confetti
    let duration = 3 * 1000;
    let animationEnd = Date.now() + duration;
    let defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    let interval = setInterval(function() {
      let timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      let particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}