const router   = require('express').Router();
const auth     = require('../middleware/auth');
const userCtrl = require('../controllers/user.controller');

router.get('/profile',         auth, userCtrl.getProfile);
router.put('/profile',         auth, userCtrl.updateProfile);
router.put('/change-password', auth, userCtrl.changePassword);
router.post('/avatar',         auth, userCtrl.uploadAvatar);
router.get('/stats',           auth, userCtrl.getStats);

module.exports = router;
