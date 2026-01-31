const router = require('express').Router();
const UserProgress = require('../models/UserProgress');
const VocabUnit = require('../models/VocabUnit');
const jwt = require('jsonwebtoken');

// Middleware xác thực và lấy userId
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // BÓC "Bearer "

  if (!token) {
    console.log("❌ Token format invalid");
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    console.log("✅ Token verified for user:", req.userId);
    next();
  } catch (err) {

    console.error("❌ Invalid token:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get or create user progress
router.get('/my-progress', verifyToken, async (req, res) => {
  try {
    console.log("📊 Fetching progress for user:", req.userId);

    let progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      console.log("📝 Creating new progress document for user:", req.userId);
      progress = new UserProgress({
        userId: req.userId,
        words: [],
        units: [],
        stats: {
          totalWordsLearned: 0,
          unitsCompleted: 0,
          totalPracticeTime: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        dailyGoal: {
          wordsPerDay: 10,
          todayProgress: 0,
          lastResetDate: new Date()
        }
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error("❌ Error loading progress:", err);
    res.status(500).json({ message: "Cannot load progress", error: err.message });
  }
});

// Get statistics for dashboard - IMPROVED VERSION
router.get('/stats', verifyToken, async (req, res) => {
  try {
    console.log("📈 Fetching stats for user:", req.userId);

    let progress = await UserProgress.findOne({ userId: req.userId });

    // If no progress exists, create one with default values
    if (!progress) {
      console.log("📝 No progress found, creating new document");
      progress = new UserProgress({
        userId: req.userId,
        words: [],
        units: [],
        stats: {
          totalWordsLearned: 0,
          unitsCompleted: 0,
          totalPracticeTime: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        dailyGoal: {
          wordsPerDay: 10,
          todayProgress: 0,
          lastResetDate: new Date()
        }
      });
      await progress.save();
    }

    const wordsForReview = progress.getWordsForReview(999).length;
    const accuracy = progress.getAccuracy();

    const statsData = {
      totalWordsLearned: progress.stats.totalWordsLearned || 0,
      unitsCompleted: progress.stats.unitsCompleted || 0,
      accuracy: accuracy || 0,
      currentStreak: progress.stats.currentStreak || 0,
      wordsForReview: wordsForReview || 0,
      longestStreak: progress.stats.longestStreak || 0
    };

    console.log("✅ Stats loaded successfully:", statsData);
    res.json(statsData);

  } catch (err) {
    console.error("❌ Error loading stats:", err);
    // Return default stats instead of error
    res.json({
      totalWordsLearned: 0,
      unitsCompleted: 0,
      accuracy: 0,
      currentStreak: 0,
      wordsForReview: 0,
      longestStreak: 0
    });
  }
});

// Get words for practice (spaced repetition)
router.get('/practice-words/:unitNumber', verifyToken, async (req, res) => {
  try {
    const unitNumber = Number(req.params.unitNumber);
    console.log("📚 Fetching practice words for unit:", unitNumber);

    const unit = await VocabUnit.findOne({ unitNumber });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    let progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      progress = new UserProgress({ userId: req.userId });
      await progress.save();
    }

    // Get words due for review
    const reviewWords = progress.getWordsForReview(5);

    // Get new words to learn
    const newWords = progress.getNewWords(unit.words, 5);

    // Combine and prepare response
    const practiceWords = [
      ...reviewWords.map(w => {
        const fullWord = unit.words.find(uw => uw._id.toString() === w.wordId.toString());
        return {
          ...fullWord.toObject(),
          progressData: {
            status: w.status,
            repetitions: w.repetitions,
            nextReviewDate: w.nextReviewDate
          }
        };
      }),
      ...newWords.map(w => ({
        ...w.toObject(),
        progressData: {
          status: 'new',
          repetitions: 0,
          nextReviewDate: new Date()
        }
      }))
    ];

    console.log("✅ Practice words prepared:", {
      newWords: newWords.length,
      reviewWords: reviewWords.length
    });

    res.json({
      words: practiceWords,
      stats: {
        newWords: newWords.length,
        reviewWords: reviewWords.length,
        totalInUnit: unit.words.length
      }
    });

  } catch (err) {
    console.error("❌ Error loading practice words:", err);
    res.status(500).json({ message: "Cannot load practice words", error: err.message });
  }
});

// Submit practice result - IMPROVED VERSION
router.post('/submit-practice', verifyToken, async (req, res) => {
  try {
    const { wordId, isCorrect, mode, unitNumber } = req.body;

    console.log("📝 Submitting practice result:", { wordId, isCorrect, mode, unitNumber });

    if (!wordId || isCorrect === undefined || !mode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      progress = new UserProgress({ userId: req.userId });
    }

    // Find or create word progress
    let wordProgress = progress.words.find(w => w.wordId.toString() === wordId);

    if (!wordProgress) {
      // Get word details from unit
      const unit = await VocabUnit.findOne({ unitNumber });
      const word = unit.words.id(wordId);

      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      // Add new word to progress
      const mongoose = require('mongoose');
      progress.words.push({
        wordId: new mongoose.Types.ObjectId(wordId),
        word: word.word,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewDate: new Date(),
        totalAttempts: 0,
        correctAttempts: 0,
        wrongAttempts: 0,
        status: 'new'
      });

      wordProgress = progress.words[progress.words.length - 1];
      progress.stats.totalWordsLearned++;
      console.log("✅ New word added to progress");
    }

    // Update word progress with spaced repetition
    progress.updateWordProgress(wordId, isCorrect, mode);

    // Update streak
    progress.updateStreak();

    // Update unit progress
    let unitProgress = progress.units.find(u => u.unitNumber === unitNumber);
    if (!unitProgress) {
      progress.units.push({
        unitNumber: unitNumber,
        completed: false,
        lastStudied: new Date(),
        score: 0
      });
      unitProgress = progress.units[progress.units.length - 1];
    }
    unitProgress.lastStudied = new Date();

    await progress.save();

    console.log("✅ Progress saved successfully");

    res.json({
      success: true,
      wordProgress: {
        status: wordProgress.status,
        repetitions: wordProgress.repetitions,
        nextReviewDate: wordProgress.nextReviewDate,
        interval: wordProgress.interval
      },
      stats: {
        totalWordsLearned: progress.stats.totalWordsLearned,
        accuracy: progress.getAccuracy(),
        currentStreak: progress.stats.currentStreak
      }
    });

  } catch (err) {
    console.error("❌ Error submitting practice result:", err);
    res.status(500).json({ message: "Cannot submit practice result", error: err.message });
  }
});

// Complete unit - IMPROVED VERSION
router.post('/complete-unit', verifyToken, async (req, res) => {
  try {
    const { unitNumber, score } = req.body;

    console.log("🎯 Completing unit:", { unitNumber, score });

    let progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      progress = new UserProgress({ userId: req.userId });
    }

    let unitProgress = progress.units.find(u => u.unitNumber === unitNumber);

    if (!unitProgress) {
      progress.units.push({
        unitNumber: unitNumber,
        completed: true,
        lastStudied: new Date(),
        score: score || 0
      });
      progress.stats.unitsCompleted++;
      console.log("✅ New unit completed");
    } else {
      if (!unitProgress.completed) {
        progress.stats.unitsCompleted++;
        console.log("✅ Unit marked as completed");
      }
      unitProgress.completed = true;
      unitProgress.score = Math.max(unitProgress.score, score || 0);
      unitProgress.lastStudied = new Date();
    }

    await progress.save();

    console.log("✅ Unit completion saved");

    res.json({
      success: true,
      unitsCompleted: progress.stats.unitsCompleted
    });

  } catch (err) {
    console.error("❌ Error completing unit:", err);
    res.status(500).json({ message: "Cannot complete unit", error: err.message });
  }
});

// Get word details with progress
router.get('/word-progress/:wordId', verifyToken, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }

    const wordProgress = progress.words.find(
      w => w.wordId.toString() === req.params.wordId
    );

    if (!wordProgress) {
      return res.status(404).json({ message: "Word not learned yet" });
    }

    res.json(wordProgress);

  } catch (err) {
    console.error("❌ Error loading word progress:", err);
    res.status(500).json({ message: "Cannot load word progress" });
  }
});

// Reset daily goal
router.post('/reset-daily', verifyToken, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.userId });

    if (!progress) {
      return res.status(404).json({ message: "No progress found" });
    }

    const today = new Date();
    const lastReset = new Date(progress.dailyGoal.lastResetDate);

    // Check if it's a new day
    if (today.toDateString() !== lastReset.toDateString()) {
      progress.dailyGoal.todayProgress = 0;
      progress.dailyGoal.lastResetDate = today;
      await progress.save();
    }

    res.json({
      success: true,
      dailyGoal: progress.dailyGoal
    });

  } catch (err) {
    console.error("❌ Error resetting daily goal:", err);
    res.status(500).json({ message: "Cannot reset daily goal" });
  }
});

module.exports = router;