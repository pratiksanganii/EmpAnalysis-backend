const userController = require('./controller/userController');
const empController = require('./controller/empController');
const chartController = require('./controller/chartController');
const { authUser } = require('./middleware');

const router = require('express').Router();
// authentication routes
router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.post('/upload', userController.upload);

// check for user token for all next routes
router.use(authUser);

router.get('/emp/list', empController.list);
router.post('/emp/create', empController.create);
router.post('/emp/update', empController.update);
router.post('/emp/delete', empController.delete);
router.get('/chart/data', chartController.data);
router.post('/chart/create', chartController.create);
router.post('/chart/update', chartController.update);
router.post('/chart/delete', chartController.delete);
module.exports = router;
