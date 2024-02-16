const userController = require('./controller/userController');

const router = require('express').Router();
// authentication routes
router.post('/login', userController.login);
router.post('/signup', userController.signup);
module.exports = router;
