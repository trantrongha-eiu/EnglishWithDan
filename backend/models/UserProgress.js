const mongoose = require("mongoose");

// Schema cho từng từ vựng mà user đã học
const WordProgressSchema = new mongoose.Schema({
  wordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  word: { type: String, required: true },
  
  // Spaced Repetition Algorithm (SM-2) fields
  easeFactor: { type: Number, default: 2.5 }, // Độ dễ (1.3 - 2.5+)
  interval: { type: Number, default: 1 },      // Khoảng cách ngày ôn tập
  repetitions: { type: Number, default: 0 },   // Số lần ôn đúng liên tiếp
  nextReviewDate: { type: Date, default: Date.now },
  
  // Statistics
  totalAttempts: { type: Number, default: 0 },
  correctAttempts: { type: Number, default: 0 },
  wrongAttempts: { type: Number, default: 0 },
  
  // Practice mode statistics
  modeStats: {
    multipleChoice: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 }
    },
    fillInBlank: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 }
    },
    listening: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 }
    },
    translation: {
      correct: { type: Number, default: 0 },
      wrong: { type: Number, default: 0 }
    }
  },
  
  lastPracticed: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['new', 'learning', 'review', 'mastered'],
    default: 'new'
  }
});

// Schema cho tiến độ của user
const UserProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Unit progress
  units: [{
    unitNumber: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    lastStudied: { type: Date, default: Date.now },
    score: { type: Number, default: 0 } // Overall score for this unit
  }],
  
  // Word progress with spaced repetition
  words: [WordProgressSchema],
  
  // Overall statistics
  stats: {
    totalWordsLearned: { type: Number, default: 0 },
    unitsCompleted: { type: Number, default: 0 },
    totalPracticeTime: { type: Number, default: 0 }, // in minutes
    currentStreak: { type: Number, default: 0 },     // days
    longestStreak: { type: Number, default: 0 },
    lastStudyDate: { type: Date }
  },
  
  // Daily goal tracking
  dailyGoal: {
    wordsPerDay: { type: Number, default: 10 },
    todayProgress: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now }
  }
  
}, { timestamps: true });

// Method: Update spaced repetition for a word
UserProgressSchema.methods.updateWordProgress = function(wordId, isCorrect, mode) {
  const wordProgress = this.words.find(w => w.wordId.toString() === wordId.toString());
  
  if (!wordProgress) return null;
  
  // Update attempts
  wordProgress.totalAttempts++;
  if (isCorrect) {
    wordProgress.correctAttempts++;
    wordProgress.repetitions++;
  } else {
    wordProgress.wrongAttempts++;
    wordProgress.repetitions = 0; // Reset repetitions on wrong answer
  }
  
  // Update mode-specific stats
  if (mode && wordProgress.modeStats[mode]) {
    if (isCorrect) {
      wordProgress.modeStats[mode].correct++;
    } else {
      wordProgress.modeStats[mode].wrong++;
    }
  }
  
  // SM-2 Algorithm for spaced repetition
  const quality = isCorrect ? 5 : 0; // 5 = perfect recall, 0 = complete blackout
  
  if (quality >= 3) {
    // Correct answer
    if (wordProgress.repetitions === 1) {
      wordProgress.interval = 1;
    } else if (wordProgress.repetitions === 2) {
      wordProgress.interval = 6;
    } else {
      wordProgress.interval = Math.round(wordProgress.interval * wordProgress.easeFactor);
    }
    
    // Update ease factor
    wordProgress.easeFactor = Math.max(
      1.3,
      wordProgress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );
    
  } else {
    // Wrong answer - review sooner
    wordProgress.repetitions = 0;
    wordProgress.interval = 1;
  }
  
  // Set next review date
  wordProgress.nextReviewDate = new Date(Date.now() + wordProgress.interval * 24 * 60 * 60 * 1000);
  wordProgress.lastPracticed = new Date();
  
  // Update status
  if (wordProgress.repetitions >= 5 && wordProgress.easeFactor >= 2.5) {
    wordProgress.status = 'mastered';
  } else if (wordProgress.repetitions >= 1) {
    wordProgress.status = 'review';
  } else if (wordProgress.totalAttempts > 0) {
    wordProgress.status = 'learning';
  }
  
  return wordProgress;
};

// Method: Get words due for review
UserProgressSchema.methods.getWordsForReview = function(limit = 10) {
  const now = new Date();
  
  return this.words
    .filter(w => w.nextReviewDate <= now && w.status !== 'mastered')
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate)
    .slice(0, limit);
};

// Method: Get new words to learn
UserProgressSchema.methods.getNewWords = function(unitWords, limit = 5) {
  const learnedWordIds = this.words.map(w => w.wordId.toString());
  
  return unitWords
    .filter(w => !learnedWordIds.includes(w._id.toString()))
    .slice(0, limit);
};

// Method: Calculate overall accuracy
UserProgressSchema.methods.getAccuracy = function() {
  const totalAttempts = this.words.reduce((sum, w) => sum + w.totalAttempts, 0);
  const correctAttempts = this.words.reduce((sum, w) => sum + w.correctAttempts, 0);
  
  return totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
};

// Method: Update daily streak
UserProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastStudy = this.stats.lastStudyDate ? new Date(this.stats.lastStudyDate) : null;
  if (lastStudy) {
    lastStudy.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, do nothing
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      this.stats.currentStreak++;
    } else {
      // Streak broken
      this.stats.currentStreak = 1;
    }
  } else {
    this.stats.currentStreak = 1;
  }
  
  // Update longest streak
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastStudyDate = new Date();
};

module.exports = mongoose.model("UserProgress", UserProgressSchema);