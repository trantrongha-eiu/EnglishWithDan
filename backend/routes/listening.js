const router = require('express').Router();
const Listening = require('../models/ListeningTest');

router.get('/', async(req,res)=>{
  res.json(await Listening.find());
});

router.get('/:id', async(req,res)=>{
  res.json(await Listening.findById(req.params.id));
});

module.exports = router;
