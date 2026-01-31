const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Atlas connected"))
.catch(err=>console.log(err));

// TEST ROOT ROUTE
app.get("/", (req, res) => {
  res.send("EnglishWithDan API is running 🚀");
});

// ROUTES
app.use("/api/auth", require('./routes/auth'));
app.use("/api/vocab", require('./routes/vocab'));
app.use("/api/reading", require('./routes/reading'));
app.use("/api/listening", require('./routes/listening'));
app.use("/api/writing", require('./routes/writing'));
app.use("/api/history", require('./routes/history'));
app.use("/api/progress", require('./routes/progress')); 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);
