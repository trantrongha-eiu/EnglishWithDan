const mongoose = require('mongoose');
const VocabUnit = require('./models/VocabUnit');
const data = require('./vocabData.json');
require('dotenv').config();

async function importData(){
  await mongoose.connect(process.env.MONGO_URI);
  await VocabUnit.deleteMany();
  await VocabUnit.insertMany(data);
  console.log("Import vocab done!");
  process.exit();
}

importData();
