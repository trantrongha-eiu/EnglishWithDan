// LOCAL ONLY: in-memory MongoDB + the API + the static frontend on one port,
// with just enough Entrance Test content to run the flow. Never touches prod.
//   node backend/scripts/_local_entrance_server.js   → http://localhost:3000
'use strict';
process.env.NODE_ENV = 'test'; // skips background AI calls (BACKGROUND_AI flag)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'local-entrance-secret';
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri());
  const app = require('../app');
  const { createPassage, createListeningSection, createWritingTask1 } = require('../tests/factories/contentFactory');
  const EntranceTestConfig = require('../models/EntranceTestConfig');
  const EntranceGrammarQuestion = require('../models/EntranceGrammarQuestion');
  const SpeakingQuestion = require('../models/SpeakingQuestion');
  const { createAdmin } = require('../tests/factories/userFactory');

  await EntranceGrammarQuestion.create([
    { setKey: 'default', order: 1, topic: 'Present Perfect', type: 'mcq', prompt: 'She ___ here since 2020.', options: [{ id: 'A', text: 'lives' }, { id: 'B', text: 'has lived' }], answer: 'B' },
    { setKey: 'default', order: 2, topic: 'Present Perfect', type: 'gap_fill', prompt: 'I ___ (finish) my homework.', accept: ['have finished'] },
  ]);
  await createPassage({ category: 'passage2', title: 'Local passage', content: '<p>The sky is blue on a clear day.</p>', questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', instruction: 'Complete the sentence.', questions: [{ questionNumber: 1, type: 'sentence-completion', questionText: 'The sky is __1__.', correctAnswer: 'blue' }] }] });
  await createListeningSection({ partNumber: 3, title: 'Local section', questionRange: { start: 1, end: 1 },
    questionGroups: [{ groupType: 'plain', questions: [{ questionNumber: 1, type: 'fill-blank', questionText: 'The answer is __1__.', correctAnswer: 'sunny' }] }],
    extra: { audioUrl: 'https://res.cloudinary.com/demo/video/upload/v1/dog.mp3', audioDuration: 60 } });
  await createWritingTask1({ prompt: 'Describe the chart.', imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' });
  await SpeakingQuestion.create({ topic: 'A trip', part: 2, question: 'Describe a trip.', cueCard: 'You should say: where', isActive: true });
  await EntranceTestConfig.create({ grammarSetKey: 'default', isActive: true });
  const admin = await createAdmin();
  const { signTokenFor } = require('../tests/factories/userFactory');
  console.log('ADMIN_TOKEN=' + signTokenFor(admin));

  const outer = express();
  outer.use((req, res, next) => (req.path.startsWith('/api') ? app(req, res, next) : next()));
  outer.use(express.static(path.join(__dirname, '..', '..', 'frontend'), { extensions: ['html'] }));
  outer.use((req, res) => res.status(404).sendFile(path.join(__dirname, '..', '..', 'frontend', '404.html')));
  outer.listen(3000, () => console.log('LOCAL READY http://localhost:3000'));
})().catch((e) => { console.error(e); process.exit(1); });
