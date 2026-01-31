// Test Spaced Repetition Algorithm
// Run: node testSRS.js

const mongoose = require('mongoose');
const UserProgress = require('./models/UserProgress');
require('dotenv').config();

async function testSRS() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create test progress
    const testProgress = new UserProgress({
      userId: new mongoose.Types.ObjectId(),
      words: []
    });

    // Test word
    const testWordId = new mongoose.Types.ObjectId();
    testProgress.words.push({
      wordId: testWordId,
      word: 'testWord',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date()
    });

    console.log('\n📊 Testing Spaced Repetition Algorithm\n');
    console.log('Initial state:');
    console.log(testProgress.words[0]);

    // Simulate learning sessions
    const sessions = [
      { isCorrect: true, day: 0 },   // Day 0: Correct
      { isCorrect: true, day: 1 },   // Day 1: Correct
      { isCorrect: true, day: 7 },   // Day 7: Correct
      { isCorrect: false, day: 24 }, // Day 24: Wrong (should reset)
      { isCorrect: true, day: 25 },  // Day 25: Correct again
      { isCorrect: true, day: 26 },  // Day 26: Correct
      { isCorrect: true, day: 32 },  // Day 32: Correct
      { isCorrect: true, day: 47 },  // Day 47: Correct
      { isCorrect: true, day: 84 },  // Day 84: Correct (should be mastered)
    ];

    console.log('\n🎯 Simulating learning sessions:\n');

    for (let session of sessions) {
      console.log(`--- Day ${session.day} ---`);
      console.log(`Answer: ${session.isCorrect ? '✅ Correct' : '❌ Wrong'}`);

      testProgress.updateWordProgress(testWordId, session.isCorrect, 'multipleChoice');

      const word = testProgress.words[0];
      console.log(`Repetitions: ${word.repetitions}`);
      console.log(`Interval: ${word.interval} days`);
      console.log(`Ease Factor: ${word.easeFactor.toFixed(2)}`);
      console.log(`Status: ${word.status}`);
      console.log(`Next Review: ${Math.round((word.nextReviewDate - new Date()) / (1000 * 60 * 60 * 24))} days from now`);
      console.log('');
    }

    // Test getWordsForReview
    console.log('\n📝 Testing getWordsForReview:');
    testProgress.words[0].nextReviewDate = new Date(); // Make it due for review
    const wordsForReview = testProgress.getWordsForReview(10);
    console.log(`Found ${wordsForReview.length} word(s) for review`);

    // Test accuracy calculation
    console.log('\n📊 Testing accuracy calculation:');
    const accuracy = testProgress.getAccuracy();
    console.log(`Overall accuracy: ${accuracy}%`);

    // Test streak update
    console.log('\n🔥 Testing streak system:');
    console.log(`Initial streak: ${testProgress.stats.currentStreak}`);
    testProgress.updateStreak();
    console.log(`After first study: ${testProgress.stats.currentStreak}`);
    testProgress.updateStreak();
    console.log(`Same day study: ${testProgress.stats.currentStreak}`);

    // Simulate next day
    testProgress.stats.lastStudyDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    testProgress.updateStreak();
    console.log(`Next day: ${testProgress.stats.currentStreak}`);

    // Simulate skip a day
    testProgress.stats.lastStudyDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
    testProgress.updateStreak();
    console.log(`After skipping a day: ${testProgress.stats.currentStreak}`);

    console.log('\n✅ All tests completed!');
    console.log('\n💡 Key insights:');
    console.log('1. Correct answers increase interval exponentially');
    console.log('2. Wrong answers reset progress');
    console.log('3. Ease factor adjusts based on performance');
    console.log('4. Status changes from new → learning → review → mastered');
    console.log('5. Streak resets if skip more than 1 day');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

testSRS();