const router = require('express').Router();
const Reading = require('../models/ReadingTest');

router.get('/', async(req,res)=>{
  res.json(await Reading.find());
});

router.get('/:id', async(req,res)=>{
  res.json(await Reading.findById(req.params.id));
});

module.exports = router;
