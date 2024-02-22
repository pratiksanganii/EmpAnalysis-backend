const userController = require('./controller/userController');
const empController = require('./controller/empController');
const chartController = require('./controller/chartController');
const miscController = require('./controller/miscController');
const { authUser } = require('./middleware');
const multer = require('multer');

const router = require('express').Router();

// Configure multer for file upload
const storage = multer.memoryStorage(); // Store file in memory (you can customize this)
const upload = multer({ storage });

// authentication routes
router.post('/login', userController.login);
router.post('/signup', userController.signup);

// check for user token for all next routes
router.use(authUser);
router.post('/upload', upload.single('file'), userController.upload);
router.post('/getUser', userController.getUser);

router.get('/emp/list', empController.list);
router.post('/emp/create', empController.create);
router.post('/emp/update', empController.update);
router.post('/emp/delete', empController.delete);
router.get('/chart/types', chartController.getTypes);
router.get('/chart/data', chartController.data);
router.post('/chart/create', chartController.create);
router.post('/chart/update', chartController.update);
router.post('/chart/delete', chartController.delete);

router.get('/misc/empData', miscController.getEmpData);
module.exports = router;
