const userController = require('./controller/userController');
const empController = require('./controller/empController');
const { authUser } = require('./middleware');

const router = require('express').Router();
// authentication routes
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/upload', userController.upload);

router.use('/emp', authUser);
router.get('/emp/list', empController.list);
router.post('/emp/create', empController.create);
router.post('/emp/update', empController.update);
router.post('/emp/delete', empController.delete);
module.exports = router;
