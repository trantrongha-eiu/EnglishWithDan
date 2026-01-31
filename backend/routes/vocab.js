const router = require('express').Router();
const VocabUnit = require('../models/VocabUnit');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra token
function verifyToken(req,res,next){
  const token = req.headers.authorization;
  if(!token) return res.status(401).json({message:"No token"});

  try{
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  }catch{
    return res.status(401).json({message:"Invalid token"});
  }
}

router.get('/units', async (req,res)=>{
  try {
    const units = await VocabUnit.find().select("unitNumber title");
    res.json(units);
  } catch (err) {
    res.status(500).json({ message: "Cannot load units" });
  }
});

router.get('/unit/:number',  async (req,res)=>{
  try {
    const unit = await VocabUnit.findOne({
      unitNumber: Number(req.params.number)
    });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.json(unit);
  } catch (err) {
    res.status(500).json({ message: "Cannot load unit" });
  }
});

module.exports = router;
