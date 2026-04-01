const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// Cloudinary config
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' })); // passages có thể dài

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Atlas connected');
    await seedSpeakingData();
  })
  .catch(err => console.log(err));

async function seedSpeakingData() {
  try {
    const SpeakingQuestion = require('./models/SpeakingQuestion');
    const SpeakingMaterial = require('./models/SpeakingMaterial');

    const qCount = await SpeakingQuestion.countDocuments();
    if (qCount === 0) {
      await SpeakingQuestion.insertMany([
        {
          topic: 'Travel',
          part: 1,
          question: 'Do you enjoy travelling? Why or why not?',
          cueCard: '',
          isActive: true
        },
        {
          topic: 'Technology',
          part: 1,
          question: 'How often do you use the internet, and what do you mainly use it for?',
          cueCard: '',
          isActive: true
        },
        {
          topic: 'Environment',
          part: 2,
          question: 'Describe a place in nature that you enjoy visiting.',
          cueCard: 'You should say:\n• Where it is\n• How often you go there\n• What you do there\n• And explain why you enjoy it',
          isActive: true
        }
      ]);
      console.log('Seeded 3 sample speaking questions.');
    }

    const mCount = await SpeakingMaterial.countDocuments();
    if (mCount === 0) {
      const samplePdf = 'https://www.africau.edu/images/default/sample.pdf';
      await SpeakingMaterial.insertMany([
        {
          title: 'Speaking Part 1 – Travel Topics',
          quarter: 'Q1 2025',
          topic: 'Travel',
          pdfUrl: samplePdf,
          isActive: true
        },
        {
          title: 'Speaking Part 1 – Technology',
          quarter: 'Q1 2025',
          topic: 'Technology',
          pdfUrl: samplePdf,
          isActive: true
        },
        {
          title: 'Speaking Part 2 & 3 – Environment',
          quarter: 'Q2 2025',
          topic: 'Environment',
          pdfUrl: samplePdf,
          isActive: true
        }
      ]);
      console.log('Seeded 3 sample speaking materials.');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// TEST ROOT ROUTE
app.get('/', (req, res) => {
  res.send('EnglishWithDan API is running 🚀');
});

// ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vocab', require('./routes/vocab'));
app.use('/api/vocabbook', require('./routes/vocabBook'));
app.use('/api/reading', require('./routes/reading')); 
app.use('/api/admin', require('./routes/admin'));      
app.use('/api/listening', require('./routes/listening'));
app.use('/api/writing',  require('./routes/writing'));
app.use('/api/speaking', require('./routes/speaking'));
app.use('/api/history',  require('./routes/history'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));