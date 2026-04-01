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
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log(err));

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
app.use('/api/writing', require('./routes/writing'));
app.use('/api/history', require('./routes/history'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));