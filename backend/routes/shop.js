const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const shopCtrl = require('../controllers/shop.controller');

// Cửa hàng lửa — not premium-gated, same as the streak/BXH it hangs off.
// See backend/services/shopService.js.
router.get('/',      auth, shopCtrl.getState);
router.get('/feed',  auth, shopCtrl.getFeed);
router.get('/pet',   auth, shopCtrl.getPet);
router.put('/pet',   auth, shopCtrl.setPet);
router.post('/buy',  auth, shopCtrl.buy);
router.post('/use',  auth, shopCtrl.use);
router.post('/sell', auth, shopCtrl.sell);
router.post('/cake', auth, shopCtrl.throwCake);
router.get('/gift-recipients', auth, shopCtrl.giftRecipients);
router.post('/gift', auth, shopCtrl.gift);
router.post('/pet-gift', auth, shopCtrl.claimPetGift);
router.post('/lens', auth, shopCtrl.useLens);
router.get('/duels', auth, shopCtrl.listDuels);
router.post('/duels', auth, shopCtrl.challenge);
router.post('/duels/:id/accept', auth, shopCtrl.acceptDuel);
router.post('/duels/:id/decline', auth, shopCtrl.declineDuel);
router.post('/duels/:id/cancel', auth, shopCtrl.cancelDuel);

module.exports = router;
