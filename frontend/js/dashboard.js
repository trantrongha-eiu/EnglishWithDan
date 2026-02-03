const API_URL = "https://englishwithdan.onrender.com/api";
const token = localStorage.getItem("token");

if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "login.html";
}

// Global variables
let currentUnit = null;
let practiceWords = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let currentMode = 'study';
let currentWord = null;
let isFlipped = false; // Track trạng thái lật thẻ
let hintUsed = false; // Track xem đã dùng gợi ý chưa
let answered = false;

// Sound Effects
const correctSound = new Audio("./sounds/correct.mp3");
const wrongSound = new Audio("./sounds/incorrect.mp3");


// Giảm âm lượng 
correctSound.volume = 0.5;
wrongSound.volume = 0.5;


// Speech Synthesis for Text-to-Speech
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Helper function for auth headers
function getAuthHeaders() {
    return {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    };
}

// Load user info
const user = JSON.parse(localStorage.getItem("user") || "{}");
if (user.firstName && user.lastName) {
    document.getElementById("userName").textContent = `👋 Xin chào, ${user.firstName} ${user.lastName}`;
} else if (user.username) {
    document.getElementById("userName").textContent = `👋 Xin chào, ${user.username}`;
}

// ==================== INITIALIZATION ====================

async function loadUnits() {
    try {
        const res = await fetch(`${API_URL}/vocab/units`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Token hết hạn. Vui lòng đăng nhập lại!");
                logout();
                return;
            }
            throw new Error("Cannot load units");
        }

        const units = await res.json();
        const select = document.getElementById("unitSelect");
        select.innerHTML = `<option value="">-- Chọn Unit --</option>`;

        units.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.unitNumber;
            opt.textContent = `Unit ${u.unitNumber} - ${u.title}`;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Error loading units:", err);
        alert("Không thể kết nối đến server!");
    }
}

async function loadUnit() {
    const number = document.getElementById("unitSelect").value;
    if (!number) {
        alert("Vui lòng chọn Unit!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/vocab/unit/${number}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            if (res.status === 401) {
                alert("Token hết hạn. Vui lòng đăng nhập lại!");
                logout();
                return;
            }
            throw new Error("Cannot load unit");
        }

        currentUnit = await res.json();
        document.getElementById("unitTitle").textContent = `Unit ${currentUnit.unitNumber}: ${currentUnit.title}`;

        document.getElementById("welcomeScreen").style.display = "none";
        document.getElementById("learningMode").style.display = "block";

        displayVocabList();
        showMode('study');
    } catch (err) {
        console.error("Error loading unit:", err);
        alert("Không thể tải Unit!");
    }
}

function displayVocabList() {
    const list = document.getElementById("vocabList");
    list.innerHTML = "";

    currentUnit.words.forEach((w, index) => {
        const card = document.createElement("div");
        card.className = "vocab-card";
        card.innerHTML = `
            <div class="vocab-number">${index + 1}</div>
            <div class="vocab-word">
                ${w.word}
                <button class="btn-audio-small" onclick="speakWord('${w.word}')" title="Phát âm">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            <div class="vocab-meaning">${w.meaning}</div>
            <div class="vocab-example">${w.example || ''}</div>
        `;
        list.appendChild(card);
    });
}

function playCorrectSound() {
    correctSound.currentTime = 0;
    correctSound.play();
}

function playWrongSound() {
    wrongSound.currentTime = 0;
    wrongSound.play();
}


// ==================== MODE SWITCHING ====================

function showMode(mode) {
    if (!currentUnit && mode !== 'study') {
        alert("Vui lòng chọn Unit trước!");
        return;
    }

    // ⭐ KIỂM TRA NẾU ĐANG TRONG PRACTICE MODE VÀ MUỐN CHUYỂN SANG MODE KHÁC
    const practiceInProgress = ['multipleChoice', 'fillBlank', 'listening', 'translation'].includes(currentMode);
    const switchingMode = mode !== currentMode && mode !== 'study';

    if (practiceInProgress && switchingMode && currentQuestionIndex > 0) {
        const modeNames = {
            'multipleChoice': 'Trắc Nghiệm',
            'fillBlank': 'Flashcard',
            'listening': 'Luyện Nghe',
            'translation': 'Dịch Từ',
            'study': 'Học Từ'
        };

        const currentModeName = modeNames[currentMode] || currentMode;
        const newModeName = modeNames[mode] || mode;

        const confirmed = confirm(
            `⚠️ Bạn đang học ${currentModeName} (${currentQuestionIndex}/${practiceWords.length} câu)\n\n` +
            `Bạn có chắc muốn chuyển sang ${newModeName}?\n\n` +
            `Tiến độ hiện tại sẽ không được lưu.`
        );

        if (!confirmed) {
            return; // Không chuyển mode, ở lại mode cũ
        }
    }

    // Hide all modes
    document.getElementById("studyMode").style.display = "none";
    document.getElementById("multipleChoiceMode").style.display = "none";
    document.getElementById("fillBlankMode").style.display = "none";
    document.getElementById("listeningMode").style.display = "none";
    document.getElementById("translationMode").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";

    // Remove active class from all tabs
    document.querySelectorAll(".tab-btn").forEach(tab => tab.classList.remove("active"));

    // Show selected mode
    currentMode = mode;

    if (mode === 'study') {
        document.getElementById("studyMode").style.display = "block";
        document.querySelectorAll(".tab-btn")[0].classList.add("active");
    } else if (mode === 'multipleChoice') {
        startPractice('multipleChoice');
        document.querySelectorAll(".tab-btn")[1].classList.add("active");
    } else if (mode === 'fillBlank') {
        startPractice('fillBlank');
        document.querySelectorAll(".tab-btn")[2].classList.add("active");
    } else if (mode === 'listening') {
        startPractice('listening');
        document.querySelectorAll(".tab-btn")[3].classList.add("active");
    } else if (mode === 'translation') {
        startPractice('translation');
        document.querySelectorAll(".tab-btn")[4].classList.add("active");
    }
}

// ==================== PRACTICE INITIALIZATION ====================

function startPractice(mode) {
    practiceWords = [...currentUnit.words];
    shuffleArray(practiceWords);
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    currentMode = mode;

    document.getElementById(`${getModeId(mode)}Mode`).style.display = "block";
    showQuestion(mode);
}

function getModeId(mode) {
    const modeMap = {
        'multipleChoice': 'multipleChoice',
        'fillBlank': 'fillBlank',
        'listening': 'listening',
        'translation': 'translation'
    };
    return modeMap[mode] || mode;
}

function getModePrefix(mode) {
    const prefixMap = {
        'multipleChoice': 'mc',
        'fillBlank': 'fb',
        'listening': 'listen',
        'translation': 'trans'
    };
    return prefixMap[mode] || 'mc';
}

// ==================== QUESTION DISPLAY ====================

function showQuestion(mode) {
    if (currentQuestionIndex >= practiceWords.length) {
        showResults(mode);
        return;
    }

    currentWord = practiceWords[currentQuestionIndex];

    if (mode === 'multipleChoice') {
        showMultipleChoiceQuestion();
    } else if (mode === 'fillBlank') {
        showFillBlankQuestion();
    } else if (mode === 'listening') {
        showListeningQuestion();
    } else if (mode === 'translation') {
        showTranslationQuestion();
    }
}

// ==================== MULTIPLE CHOICE MODE ====================

function showMultipleChoiceQuestion() {
    const prefix = 'mc';
    updateProgress(prefix);

    document.getElementById(`${prefix}QuestionNumber`).textContent =
        `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;
    document.getElementById(`${prefix}QuestionText`).textContent =
        `"${currentWord.word}" có nghĩa là gì?`;

    const options = generateOptions(currentWord);
    const optionsContainer = document.getElementById(`${prefix}AnswerOptions`);
    optionsContainer.innerHTML = "";

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "answer-option";
        btn.textContent = opt;
        btn.onclick = () => checkMultipleChoice(btn, opt, currentWord.meaning);
        optionsContainer.appendChild(btn);
    });

    document.getElementById(`${prefix}BtnNext`).style.display = "none";
}

function generateOptions(correctWord) {
    const options = [correctWord.meaning];
    const otherWords = currentUnit.words.filter(w => w.word !== correctWord.word);

    while (options.length < 4 && otherWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        const randomMeaning = otherWords[randomIndex].meaning;

        if (!options.includes(randomMeaning)) {
            options.push(randomMeaning);
        }
        otherWords.splice(randomIndex, 1);
    }

    shuffleArray(options);
    return options;
}

function checkMultipleChoice(btn, selected, correct) {
    const allOptions = document.querySelectorAll("#mcAnswerOptions .answer-option");
    allOptions.forEach(opt => opt.disabled = true);

    const isCorrect = selected === correct;

    if (isCorrect) {
        btn.classList.add("correct");
        correctAnswers++;
        playCorrectSound();
    } else {
        btn.classList.add("wrong");
        wrongAnswers++;
        playWrongSound();
        allOptions.forEach(opt => {
            if (opt.textContent === correct) {
                opt.classList.add("correct");
            }
        });
    }

    document.getElementById("mcBtnNext").style.display = "block";
}

// ==================== FILL IN BLANK MODE (FLASHCARD) ====================

function showFillBlankQuestion() {
    answered = false;
    const prefix = 'fb';
    updateProgress(prefix);

    document.getElementById(`${prefix}QuestionNumber`).textContent =
        `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;

    // Reset trạng thái flashcard
    isFlipped = false;
    hintUsed = false;

    const front = document.getElementById('flashcardFront');
    const back = document.getElementById('flashcardBack');
    const card = document.getElementById('flashcard');

    // Đảm bảo reset về trạng thái ban đầu
    front.style.display = 'flex';
    back.style.display = 'none';
    card.classList.remove('fade-out', 'fade-in');

    // Hiển thị nghĩa ở mặt trước
    document.getElementById(`${prefix}Meaning`).textContent = currentWord.meaning;

    // Hiển thị từ ở mặt sau
    document.getElementById(`${prefix}Word`).textContent = currentWord.word;

    // Reset input và feedback
    const input = document.getElementById(`${prefix}Input`);
    input.value = "";
    input.disabled = false;

    // Reset hint button
    const hintBtn = document.getElementById('btnHint');
    if (hintBtn) {
        hintBtn.disabled = false;
        hintBtn.style.display = 'inline-flex';
    }

    // ⭐ RESET QUICK REVIEW BUTTONS - QUAN TRỌNG!
    const rememberedBtn = document.querySelector('.btn-remembered');
    const notRememberedBtn = document.querySelector('.btn-not-remembered');
    if (rememberedBtn) {
        rememberedBtn.disabled = false;
    }
    if (notRememberedBtn) {
        notRememberedBtn.disabled = false;
    }

    document.getElementById(`${prefix}Feedback`).innerHTML = "";
    document.getElementById(`${prefix}BtnNext`).style.display = "none";
}

function flipCard() {
    const front = document.getElementById('flashcardFront');
    const back = document.getElementById('flashcardBack');
    const card = document.getElementById('flashcard');

    if (!isFlipped) {
        // Lật từ mặt trước sang mặt sau
        card.classList.add('fade-out');

        setTimeout(() => {
            front.style.display = 'none';
            back.style.display = 'flex';

            card.classList.remove('fade-out');
            card.classList.add('fade-in');

            // Phát âm từ khi lật sang mặt sau
            setTimeout(() => {
                speakWord(currentWord.word);
            }, 200);

            // Focus vào input sau khi animation xong
            setTimeout(() => {
                const input = document.getElementById('fbInput');
                if (input) {
                    input.focus();
                }
            }, 100);
        }, 300);

        isFlipped = true;

    } else {
        // Lật từ mặt sau về mặt trước
        card.classList.add('fade-out');

        setTimeout(() => {
            back.style.display = 'none';
            front.style.display = 'flex';

            card.classList.remove('fade-out');
            card.classList.add('fade-in');

            // Reset input khi quay lại
            document.getElementById('fbInput').value = "";
            document.getElementById('fbInput').disabled = false;
            document.getElementById('fbFeedback').innerHTML = "";

            // Reset hint button
            const hintBtn = document.getElementById('btnHint');
            if (hintBtn) {
                hintBtn.disabled = false;
            }
            hintUsed = false;
        }, 300);

        isFlipped = false;
    }
}

function markAsRemembered() {
    if (!isFlipped) {
        alert('Vui lòng lật thẻ để xem từ trước!');
        return;
    }

    correctAnswers++;

    // Hiển thị feedback ngắn
    document.getElementById('fbFeedback').innerHTML = `
        <div class="feedback-correct">
            <i class="fas fa-check-circle"></i>
            <strong>Tuyệt vời!</strong> Bạn đã ghi nhớ từ này! 🎉
        </div>
    `;

    // Disable buttons để tránh spam
    disableQuickReviewButtons();
    document.getElementById('fbInput').disabled = true;
    const hintBtn = document.getElementById('btnHint');
    if (hintBtn) {
        hintBtn.disabled = true;
    }

    // Tự động chuyển sang câu tiếp theo sau 1 giây
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion('fillBlank');
    }, 3000);
}

function markAsNotRemembered() {
    if (!isFlipped) {
        alert('Vui lòng lật thẻ để xem từ trước!');
        return;
    }

    wrongAnswers++;

    // Hiển thị feedback với thông tin từ
    document.getElementById('fbFeedback').innerHTML = `
        <div class="feedback-wrong">
            <i class="fas fa-info-circle"></i>
            Đừng lo! Hãy xem lại từ <strong>${currentWord.word}</strong>
            <br><small>Nghĩa: ${currentWord.meaning}</small>
        </div>
    `;

    // Disable buttons để tránh spam
    disableQuickReviewButtons();
    document.getElementById('fbInput').disabled = true;
    const hintBtn = document.getElementById('btnHint');
    if (hintBtn) {
        hintBtn.disabled = true;
    }

    // Tự động chuyển sang câu tiếp theo sau 1.5 giây (lâu hơn 1 chút để đọc feedback)
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion('fillBlank');
    }, 3500);
}

function disableQuickReviewButtons() {
    const btns = document.querySelectorAll('.btn-remembered, .btn-not-remembered');
    btns.forEach(btn => btn.disabled = true);
}

function showHint() {
    if (!isFlipped) {
        alert('Vui lòng lật thẻ để xem từ trước!');
        return;
    }

    const firstLetter = currentWord.word.charAt(0);
    const wordLength = currentWord.word.length;
    const hint = `${firstLetter}${'_'.repeat(wordLength - 1)}`;

    document.getElementById('fbFeedback').innerHTML = `
        <div class="feedback-hint">
            <i class="fas fa-lightbulb"></i>
            Gợi ý: <strong>${hint}</strong> (${wordLength} chữ cái)
        </div>
    `;

    document.getElementById('btnHint').disabled = true;
    hintUsed = true;
}

function handleFillBlankEnter(event) {
    if (event.key === 'Enter') {
        checkFillBlank();
    }
}

function checkFillBlank() {
    if (answered) return;   // ⭐ chặn chạy lần 2
    answered = true;

    // Phải lật thẻ trước khi kiểm tra
    if (!isFlipped) {
        alert('Vui lòng lật thẻ để xem từ trước!');
        return;
    }

    const input = document.getElementById("fbInput");
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();
    const feedback = document.getElementById("fbFeedback");

    if (!userAnswer) {
        feedback.innerHTML = `
            <div class="feedback-wrong">
                <i class="fas fa-exclamation-circle"></i>
                Vui lòng nhập từ vào ô!
            </div>
        `;
        return;
    }

    input.disabled = true;

    // Disable hint button after checking
    const hintBtn = document.getElementById('btnHint');
    if (hintBtn) {
        hintBtn.disabled = true;
    }

    // Disable quick review buttons
    disableQuickReviewButtons();

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <i class="fas fa-check-circle"></i>
                <strong>Xuất sắc!</strong> Bạn đã nhớ từ này rồi! 🎉
            </div>
        `;
        correctAnswers++;
         playCorrectSound();
    } else {
        feedback.innerHTML = `
            <div class="feedback-wrong">
                <i class="fas fa-times-circle"></i>
                <strong>Chưa chính xác!</strong> Đáp án đúng là: <strong>${currentWord.word}</strong>
                <br><small>Nghĩa: ${currentWord.meaning}</small>
                <button class="btn-replay" onclick="speakWord('${currentWord.word}')">
                    <i class="fas fa-redo"></i> Nghe lại
                </button>
            </div>
        `;
        wrongAnswers++;
        playWrongSound();
    }

    document.getElementById("fbBtnNext").style.display = "block";
}

// ==================== LISTENING MODE ====================

function showListeningQuestion() {
    answered = false;
    const prefix = 'listen';
    updateProgress(prefix);

    document.getElementById(`${prefix}QuestionNumber`).textContent =
        `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;

    const wordLength = currentWord.word.length;
    document.getElementById(`${prefix}Hint`).innerHTML =
        `<i class="fas fa-info-circle"></i> Gợi ý: Từ có ${wordLength} chữ cái`;

    document.getElementById(`${prefix}Input`).value = "";
    document.getElementById(`${prefix}Input`).disabled = false;
    document.getElementById(`${prefix}Feedback`).innerHTML = "";
    document.getElementById(`${prefix}BtnNext`).style.display = "none";

    setTimeout(() => speakWord(currentWord.word), 500);
}

function playAudio() {
    speakWord(currentWord.word);
}

function speakWord(word) {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.6;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);
}

function handleListeningEnter(event) {
    if (event.key === 'Enter') {
        checkListening();
    }
}

function checkListening() {
    if (answered) return;   // ⭐ chặn chạy lần 2
    answered = true;

    const input = document.getElementById("listenInput");
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = currentWord.word.toLowerCase();
    const feedback = document.getElementById("listenFeedback");

    input.disabled = true;

    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <i class="fas fa-check-circle"></i>
                <strong>Xuất sắc!</strong> Bạn đã nghe đúng: <strong>${currentWord.word}</strong>
                <br><small>Nghĩa: ${currentWord.meaning}</small>
            </div>
        `;
        correctAnswers++;
        playCorrectSound(); 
    } else {
        feedback.innerHTML = `
            <div class="feedback-wrong">
                <i class="fas fa-times-circle"></i>
                <strong>Chưa chính xác!</strong> Từ đúng là: <strong>${currentWord.word}</strong>
                <br><small>Nghĩa: ${currentWord.meaning}</small>
                <button class="btn-replay" onclick="speakWord('${currentWord.word}')">
                    <i class="fas fa-redo"></i> Nghe lại
                </button>
            </div>
        `;
        wrongAnswers++;
        playWrongSound();
    }

    document.getElementById("listenBtnNext").style.display = "block";
}

// ==================== TRANSLATION MODE ====================

function showTranslationQuestion() {
    answered = false;
    const prefix = 'trans';
    updateProgress(prefix);

    document.getElementById(`${prefix}QuestionNumber`).textContent =
        `Câu ${currentQuestionIndex + 1}/${practiceWords.length}`;

    const example = currentWord.example || `The word is: ${currentWord.word}`;
    const highlightedExample = example.replace(
        new RegExp(`\\b${currentWord.word}\\b`, 'gi'),
        `<strong class="highlight-word">${currentWord.word}</strong>`
    );

    document.getElementById(`${prefix}Example`).innerHTML = highlightedExample;
    document.getElementById(`${prefix}WordHighlight`).innerHTML =
        `Dịch từ: <strong>${currentWord.word}</strong>`;

    document.getElementById(`${prefix}Input`).value = "";
    document.getElementById(`${prefix}Input`).disabled = false;
    document.getElementById(`${prefix}Feedback`).innerHTML = "";
    document.getElementById(`${prefix}BtnNext`).style.display = "none";
    document.getElementById(`${prefix}Input`).focus();
}

function handleTranslationEnter(event) {
    if (event.key === 'Enter') {
        checkTranslation();
    }
}

function checkTranslation() {
    if (answered) return;   // ⭐ chặn chạy lần 2
    answered = true;

    const input = document.getElementById("transInput");
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = currentWord.meaning.toLowerCase();
    const feedback = document.getElementById("transFeedback");

    input.disabled = true;

    const correctWords = correctAnswer.split(/[\s,]+/).filter(w => w.length > 2);
    const userWords = userAnswer.split(/[\s,]+/).filter(w => w.length > 2);

    const matchedWords = correctWords.filter(word =>
        userWords.some(uword => uword.includes(word) || word.includes(uword))
    );

    const isCorrect = matchedWords.length >= correctWords.length * 0.7;

    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <i class="fas fa-check-circle"></i>
                <strong>Tốt lắm!</strong> Đáp án của bạn đúng rồi!
                <br><small>Đáp án chuẩn: ${currentWord.meaning}</small>
            </div>
        `;
        correctAnswers++;
        playCorrectSound();
    } else {
        feedback.innerHTML = `
            <div class="feedback-wrong">
                <i class="fas fa-times-circle"></i>
                <strong>Chưa chính xác!</strong> 
                <br>Nghĩa đúng: <strong>${currentWord.meaning}</strong>
            </div>
        `;
        wrongAnswers++;
        playWrongSound();
    }

    document.getElementById("transBtnNext").style.display = "block";
}

// ==================== PROGRESS TRACKING ====================

function updateProgress(prefix) {
    const progress = ((currentQuestionIndex) / practiceWords.length) * 100;
    document.getElementById(`${prefix}ProgressFill`).style.width = progress + "%";
    document.getElementById(`${prefix}ProgressText`).textContent =
        `${currentQuestionIndex + 1}/${practiceWords.length}`;
}

// ==================== NAVIGATION ====================

function nextQuestion(mode) {
    currentQuestionIndex++;
    showQuestion(mode);
}

function restartPractice() {
    document.getElementById("resultsScreen").style.display = "none";
    startPractice(currentMode);
}

// ==================== RESULTS ====================

function showResults(mode) {
    const total = practiceWords.length;
    const percentage = Math.round((correctAnswers / total) * 100);

    document.getElementById(`${getModeId(mode)}Mode`).style.display = "none";
    document.getElementById("resultsScreen").style.display = "block";

    const modeNames = {
        'multipleChoice': 'Trắc Nghiệm',
        'fillBlank': 'Flashcard',
        'listening': 'Luyện Nghe',
        'translation': 'Dịch Từ'
    };
    document.getElementById("resultModeTitle").textContent = `Chế độ: ${modeNames[mode]}`;

    document.getElementById("scorePercent").textContent = percentage + "%";
    document.getElementById("correctCount").textContent = correctAnswers;
    document.getElementById("wrongCount").textContent = wrongAnswers;

    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    const circle = document.getElementById("scoreCircle");

    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);

    if (percentage >= 80) {
        circle.style.stroke = "#10b981";
    } else if (percentage >= 50) {
        circle.style.stroke = "#f59e0b";
    } else {
        circle.style.stroke = "#ef4444";
    }
}

let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;

    document.getElementById("soundToggle").textContent =
        soundEnabled ? "🔊 Sound: ON" : "🔇 Sound: OFF";
}

function playCorrectSound() {
    if (!soundEnabled) return;
    correctSound.currentTime = 0;
    correctSound.play();
}

function playWrongSound() {
    if (!soundEnabled) return;
    wrongSound.currentTime = 0;
    wrongSound.play();
}


// ==================== UTILITIES ====================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// ==================== INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Dashboard initializing...");
    loadUnits();
});