
const router = require('express').Router();
const authController = require('./controllers/authController');
const activateController = require('./controllers/activateController');
const authMiddleware = require('./middlewares/authMiddleware');
const roomsController = require('./controllers/roomsController');

router.post('/api/send-otp', authController.sendOtp);
router.post('/api/verify-otp', authController.verifyOtp);
router.post('/api/activate', authMiddleware, activateController.activate);
router.get('/api/refresh', authController.refresh);//refresh token
router.post('/api/logout', authMiddleware, authController.logout);
router.post('/api/rooms', authMiddleware, roomsController.create);
router.get('/api/rooms', authMiddleware, roomsController.index);
router.get('/api/rooms/:roomId', authMiddleware, roomsController.show);
router.get('/api/test', (req, res) => res.json({ msg: 'OK' }));


module.exports = router;