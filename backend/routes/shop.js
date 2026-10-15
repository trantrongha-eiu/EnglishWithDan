const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const shopCtrl = require('../controllers/shop.controller');

// Cửa hàng lửa — not premium-gated, same as the streak/BXH it hangs off.
// See backend/services/shopService.js.
router.get('/',      auth, shopCtrl.getState);
router.get('/pet',   auth, shopCtrl.getPet);
router.put('/pet',   auth, shopCtrl.setPet);
router.post('/buy',  auth, shopCtrl.buy);
router.post('/use',  auth, shopCtrl.use);
router.post('/cake', auth, shopCtrl.throwCake);

module.exports = router;
