'use strict';

// One-off content-curation migration: tags every existing Part 2/3
// SpeakingQuestion with one of the 7 cue-card groups from Daniel's Speaking
// textbook (same taxonomy speaking-course.html's Part 2 module already
// teaches — see services/speakingService.js's SPEAKING_GROUPS). Part 2 and
// its matching Part 3 follow-ups share the exact same `topic` string, so one
// mapping entry tags both at once. This was a manual, judgment-call
// classification of the 62 topics live in the DB at the time this was
// written — review it and re-run with corrections/additions as needed
// (running it again is a no-op except where the mapping actually changed).
//
// Usage: node scripts/assignSpeakingPart23Groups.js [--dry-run]

require('dotenv').config();
const mongoose = require('mongoose');
const SpeakingQuestion = require('../models/SpeakingQuestion');

const TOPIC_GROUPS = {
  people: [
    'A child who likes painting/drawing',
    'A childhood friend you remember well',
    'A famous person to meet',
    'A person good at learning languages',
    'A person who achieved something difficult',
    "A person who didn't reply to your messages",
    'A person who enjoys growing plants',
    'A person who likes helping others',
    'A person working in the medical field',
    'A successful businessperson you know',
    'Proud of a family member',
  ],
  places: [
    'A city you enjoy visiting',
    'A far-away place to visit in future',
    'A good place to live',
    'A holiday place you would recommend',
    'A home you like to visit but not live in',
    'A place you found boring',
    'A quiet place',
    'A shopping place',
    'A tall building you like or dislike',
    'An interesting building to visit',
  ],
  objects: [
    'A special cake you received',
    'An app or software you use',
    'A traditional product you like',
  ],
  events: [
    'A clever solution to a problem',
    'A difficult decision with a good result',
    'A live sport match you watched',
    'A power outage',
    'A technology problem you encountered',
    'A time you changed a decision',
    'A time you changed your opinion',
    'A time you changed your plan',
    'An important decision you had to make',
    'An interesting trip',
    'Encouraging someone to do something',
    'Getting up very early',
    'Giving advice',
    'Not allowed to use your phone',
    'Paying more than expected',
    'People smiling',
    'Repairing something broken at home',
    'Waiting for something special to happen',
    'Working abroad for a short time',
  ],
  activities_skills: [
    'A long-held ambition',
    'A perfect future job',
    'Good at planning',
    'Learning without a teacher',
    'Trying an activity for the first time',
    'Using your imagination',
  ],
  nature_science: [
    'A wild animal to learn more about',
    'An environmental protection law',
    'Future technology you want',
    'Protecting the environment',
  ],
  culture_media: [
    'A TV/online programme you enjoy',
    'A movie you enjoyed',
    'A piece of local news',
    'A tradition in your country',
    'An advertisement featuring a famous person',
    'An animal story (movie or book)',
    'An interesting video on social media',
    'Food eaten at special occasions',
    "Music you didn't like at an event",
  ],
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  await mongoose.connect(process.env.MONGO_URI);

  const knownTopics = new Set();
  for (const list of Object.values(TOPIC_GROUPS)) for (const t of list) knownTopics.add(t);

  let totalMatched = 0;
  for (const [group, topics] of Object.entries(TOPIC_GROUPS)) {
    if (dryRun) {
      const n = await SpeakingQuestion.countDocuments({ topic: { $in: topics }, part: { $in: [2, 3] } });
      console.log(`[dry-run] ${group}: would tag ${n} question(s) across ${topics.length} topic(s)`);
      totalMatched += n;
      continue;
    }
    const res = await SpeakingQuestion.updateMany(
      { topic: { $in: topics }, part: { $in: [2, 3] } },
      { $set: { group } },
    );
    console.log(`${group}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
    totalMatched += res.matchedCount;
  }

  // Surface anything left ungrouped — either a real topic missing from the
  // mapping above (needs a new entry) or test/debris data worth a look.
  const allPart23Topics = await SpeakingQuestion.distinct('topic', { part: { $in: [2, 3] } });
  const unmapped = allPart23Topics.filter((t) => !knownTopics.has(t));
  if (unmapped.length) {
    console.log('\nUngrouped topics (not in TOPIC_GROUPS above):');
    unmapped.forEach((t) => console.log('  -', t));
  }
  console.log(`\nTotal matched: ${totalMatched}${dryRun ? ' (dry run — nothing written)' : ''}`);

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
