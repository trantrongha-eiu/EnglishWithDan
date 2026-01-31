const router = require('express').Router();
const Writing = require('../models/WritingTask');

router.get('/', async(req,res)=>{
  res.json(await Writing.find());
});

router.get('/:id', async(req,res)=>{
  res.json(await Writing.findById(req.params.id));
});

module.exports = router;
