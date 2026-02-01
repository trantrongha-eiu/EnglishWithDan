/**
 * IELTS Reading Practice - JavaScript
 * Handles test loading, navigation, timing, and submission
 */

// Global variables
let currentTest = null;
let currentPassageIndex = 0;
let userAnswers = {};
let timerInterval = null;
let timeRemaining = 3650; // 60 minutes in seconds
let testSubmitted = false;

// API Configuration
const API_BASE_URL = 'https://englishwithdan.onrender.com/api';
// ===================================
// Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  loadTest();
  initializeTimer();
  setupEventListeners();
});

// ===================================
// Test Loading
// ===================================

async function loadTest() {
  try {
    showLoading();

    // Fetch test data from API
    const response = await fetch(`${API_BASE_URL}/api/reading`);

    if (!response.ok) {
      throw new Error('Failed to load test');
    }

    const tests = await response.json();

    if (tests.length === 0) {
      showError('No tests available');
      return;
    }

    // Load first test
    currentTest = tests[0];
    timeRemaining = currentTest.timeLimit * 60;

    renderTest();

  } catch (error) {
    console.error('Error loading test:', error);
    showError('Failed to load test. Please check your connection.');
  }
}

function showLoading() {
  document.getElementById('passageText').innerHTML = '<p class="loading-message">Đang tải bài test...</p>';
}

function showError(message) {
  document.getElementById('passageText').innerHTML = `<p class="loading-message" style="color: var(--color-error);">${message}</p>`;
}

// ===================================
// Test Rendering
// ===================================

function renderTest() {
  // Render test title
  document.getElementById('testTitle').textContent = currentTest.title;

  // Render passage selector buttons
  renderPassageSelector();

  // Render question navigator
  renderQuestionNavigator();

  // Render first passage
  renderPassage(0);
}

function renderPassageSelector() {
  const selector = document.getElementById('passageSelector');
  selector.innerHTML = '';

  currentTest.passages.forEach((passage, index) => {
    const btn = document.createElement('button');
    btn.className = `passage-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = `Passage ${passage.passageNumber}`;
    btn.onclick = () => switchPassage(index);
    selector.appendChild(btn);
  });
}

function renderQuestionNavigator() {
  const grid = document.getElementById('questionGrid');
  grid.innerHTML = '';

  currentTest.passages.forEach(passage => {
    passage.questions.forEach(question => {
      const div = document.createElement('div');
      div.className = 'question-number';
      div.textContent = question.questionNumber;
      div.onclick = () => scrollToQuestion(question.questionNumber);

      // Check if answered
      if (userAnswers[question.questionNumber]) {
        div.classList.add('answered');
      }

      grid.appendChild(div);
    });
  });
}

function renderPassage(passageIndex) {
  currentPassageIndex = passageIndex;
  const passage = currentTest.passages[passageIndex];

  // Update active button
  document.querySelectorAll('.passage-btn').forEach((btn, index) => {
    btn.classList.toggle('active', index === passageIndex);
  });

  // Render passage text
  document.getElementById('passageTitle').textContent = passage.title;
  document.getElementById('passageText').innerHTML = formatPassageText(passage.text);

  // Render questions
  renderQuestions(passage.questions);
}

function formatPassageText(text) {
  const paragraphs = text.split('\n\n');
  return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
}

function renderQuestions(questions) {
  const container = document.getElementById('questionsContent');
  container.innerHTML = '';

  questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    questionDiv.id = `question-${question.questionNumber}`;

    questionDiv.innerHTML = `
            <div class="question-header">
                <span class="question-number-badge">Question ${question.questionNumber}</span>
                <span class="question-type-badge">${question.questionType}</span>
            </div>
            <div class="question-text">${question.question}</div>
            ${renderQuestionInput(question)}
            <div class="explanation" id="explanation-${question.questionNumber}">
                <strong>Explanation:</strong> ${question.explanation || 'No explanation available.'}
            </div>
        `;

    container.appendChild(questionDiv);
  });
}

function renderQuestionInput(question) {
  const qNum = question.questionNumber;

  // For questions with options (Multiple Choice, True/False/Not Given, etc.)
  if (question.options && question.options.length > 0) {
    return `
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <div class="option-item ${userAnswers[qNum] === option ? 'selected' : ''}" 
                         onclick="selectOption(${qNum}, '${escapeHtml(option)}')">
                        <input type="radio" 
                               name="q${qNum}" 
                               value="${escapeHtml(option)}" 
                               id="q${qNum}_${index}"
                               ${userAnswers[qNum] === option ? 'checked' : ''}>
                        <label for="q${qNum}_${index}">${option}</label>
                    </div>
                `).join('')}
            </div>
        `;
  }

  // For text input questions (Short-answer, Sentence Completion, etc.)
  return `
        <input type="text" 
               class="text-input" 
               id="input-${qNum}"
               placeholder="Type your answer here..."
               value="${userAnswers[qNum] || ''}"
               oninput="handleTextInput(${qNum}, this.value)">
    `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===================================
// User Interaction
// ===================================

function switchPassage(index) {
  renderPassage(index);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function selectOption(questionNumber, answer) {
  userAnswers[questionNumber] = answer;

  // Update UI
  const questionDiv = document.getElementById(`question-${questionNumber}`);
  const options = questionDiv.querySelectorAll('.option-item');

  options.forEach(option => {
    const radio = option.querySelector('input[type="radio"]');
    if (radio.value === answer) {
      option.classList.add('selected');
      radio.checked = true;
    } else {
      option.classList.remove('selected');
    }
  });

  updateQuestionNavigator();
}

function handleTextInput(questionNumber, value) {
  userAnswers[questionNumber] = value.trim();
  updateQuestionNavigator();
}

function scrollToQuestion(questionNumber) {
  const element = document.getElementById(`question-${questionNumber}`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = 'slideDown 0.3s ease';
    }, 10);
  }
}

function updateQuestionNavigator() {
  const questionNumbers = document.querySelectorAll('.question-number');
  questionNumbers.forEach(div => {
    const qNum = parseInt(div.textContent);
    if (userAnswers[qNum]) {
      div.classList.add('answered');
    } else {
      div.classList.remove('answered');
    }
  });
}

// ===================================
// Timer
// ===================================

function initializeTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (!testSubmitted) {
      timeRemaining--;
      updateTimerDisplay();

      // Auto-submit when time runs out
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        alert('Time is up! Your test will be submitted automatically.');
        submitTest();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('timeRemaining').textContent = display;

  // Warning when less than 5 minutes
  if (timeRemaining < 300 && timeRemaining > 0) {
    document.getElementById('timerDisplay').style.background = 'linear-gradient(135deg, var(--color-error), #a00d25)';
  }
}

// ===================================
// Test Submission
// ===================================

async function submitTest() {
  if (testSubmitted) return;

  // Confirm submission
  const totalQuestions = currentTest.passages.reduce((sum, p) => sum + p.questions.length, 0);
  const answeredCount = Object.keys(userAnswers).length;

  if (answeredCount < totalQuestions) {
    const confirm = window.confirm(
      `You have answered ${answeredCount} out of ${totalQuestions} questions.\n\nDo you want to submit anyway?`
    );
    if (!confirm) return;
  }

  testSubmitted = true;
  clearInterval(timerInterval);

  // Calculate score
  const results = calculateScore();

  // Save to database
  await saveTestHistory(results);

  // Show results
  showResults(results);
}

function calculateScore() {
  let correctCount = 0;
  const totalQuestions = [];

  currentTest.passages.forEach(passage => {
    passage.questions.forEach(question => {
      totalQuestions.push(question);

      const userAnswer = userAnswers[question.questionNumber];
      const correctAnswer = question.correctAnswer;

      // Normalize answers for comparison
      const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);

      if (isCorrect) {
        correctCount++;
      }
    });
  });

  const bandScore = calculateBandScore(correctCount, totalQuestions.length);

  return {
    score: correctCount,
    total: totalQuestions.length,
    bandScore: bandScore,
    questions: totalQuestions,
    timeSpent: currentTest.timeLimit * 60 - timeRemaining
  };
}

function normalizeAnswer(answer) {
  if (!answer) return '';
  return answer.toString().toLowerCase().trim();
}

function calculateBandScore(correct, total) {
  const percentage = (correct / total) * 100;

  // IELTS Reading band score conversion (approximate)
  if (percentage >= 90) return 9.0;
  if (percentage >= 83) return 8.5;
  if (percentage >= 75) return 8.0;
  if (percentage >= 68) return 7.5;
  if (percentage >= 60) return 7.0;
  if (percentage >= 53) return 6.5;
  if (percentage >= 45) return 6.0;
  if (percentage >= 38) return 5.5;
  if (percentage >= 30) return 5.0;
  if (percentage >= 23) return 4.5;
  if (percentage >= 15) return 4.0;
  return 3.5;
}

async function saveTestHistory(results) {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!user._id) {
      console.warn('No user logged in. Test history not saved.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user._id,
        type: 'reading',
        referenceId: currentTest._id,
        score: results.score,
        totalQuestions: results.total,
        bandScore: results.bandScore,
        answers: userAnswers,
        timeSpent: results.timeSpent
      })
    });

    if (!response.ok) {
      console.error('Failed to save test history');
    }

  } catch (error) {
    console.error('Error saving test history:', error);
  }
}

function showResults(results) {
  const modal = document.getElementById('resultsModal');

  // Update score display
  document.getElementById('scoreNumber').textContent = results.score;
  document.getElementById('scoreTotal').textContent = `/${results.total}`;
  document.getElementById('bandScore').textContent = results.bandScore.toFixed(1);
  document.getElementById('correctCount').textContent = results.score;
  document.getElementById('wrongCount').textContent = results.total - results.score;

  // Animate score ring
  const percentage = (results.score / results.total) * 100;
  const circumference = 314; // 2 * PI * 50
  const offset = circumference - (percentage / 100) * circumference;

  setTimeout(() => {
    document.getElementById('scoreRingFill').style.strokeDashoffset = offset;
  }, 300);

  // Render answer review
  renderAnswerReview(results);

  // Show modal
  modal.classList.add('show');

  // Mark questions in navigator
  markQuestionsInNavigator(results);
}

function renderAnswerReview(results) {
  const container = document.getElementById('answerReview');
  container.innerHTML = '<h3 style="margin-bottom: 1rem; font-family: var(--font-display);">Answer Review</h3>';

  results.questions.forEach(question => {
    const userAnswer = userAnswers[question.questionNumber] || 'Not answered';
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);

    const reviewDiv = document.createElement('div');
    reviewDiv.className = `review-item ${isCorrect ? 'correct-answer' : 'wrong-answer'}`;
    reviewDiv.innerHTML = `
            <strong>Question ${question.questionNumber}:</strong> ${question.question}<br>
            <strong>Your answer:</strong> ${userAnswer}<br>
            <strong>Correct answer:</strong> ${question.correctAnswer}<br>
            ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
        `;

    container.appendChild(reviewDiv);
  });
}

function markQuestionsInNavigator(results) {
  results.questions.forEach(question => {
    const userAnswer = userAnswers[question.questionNumber];
    const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);

    const questionDiv = document.querySelector(`.question-number:nth-child(${question.questionNumber})`);
    if (questionDiv) {
      questionDiv.classList.remove('answered');
      questionDiv.classList.add(isCorrect ? 'correct' : 'incorrect');
    }

    // Show explanations
    const explanation = document.getElementById(`explanation-${question.questionNumber}`);
    if (explanation) {
      explanation.classList.add('show');
    }

    // Mark options as correct/incorrect
    const questionElement = document.getElementById(`question-${question.questionNumber}`);
    if (questionElement) {
      const options = questionElement.querySelectorAll('.option-item');
      options.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio && radio.value === question.correctAnswer) {
          option.classList.add('correct');
        } else if (radio && radio.checked && !isCorrect) {
          option.classList.add('incorrect');
        }
      });
    }
  });
}

// ===================================
// Modal Controls
// ===================================

function closeModal() {
  document.getElementById('resultsModal').classList.remove('show');
}

function retakeTest() {
  if (confirm('Are you sure you want to retake this test? Your current answers will be lost.')) {
    location.reload();
  }
}

// ===================================
// Event Listeners
// ===================================

function setupEventListeners() {
  // Toggle navigator on mobile
  const toggleBtn = document.getElementById('toggleNavigator');
  const navigator = document.getElementById('questionNavigator');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      navigator.classList.toggle('open');
    });
  }

  // Close modal on outside click
  const modal = document.getElementById('resultsModal');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Prevent accidental page refresh
  window.addEventListener('beforeunload', (e) => {
    if (!testSubmitted) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// ===================================
// Utility Functions
// ===================================

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// Export functions for HTML onclick handlers
window.submitTest = submitTest;
window.closeModal = closeModal;
window.retakeTest = retakeTest;