const express = require('express');
const router = express.Router();
const projectCtrl = require('../controllers/projectController');
const { auth, checkAdmin } = require('../middleware/auth');

router.get('/', auth, projectCtrl.getProjects);

router.post('/create', auth, checkAdmin, projectCtrl.createProject);

router.post('/add-member', auth, checkAdmin, projectCtrl.addMember);
router.post('/remove-member', auth, checkAdmin, projectCtrl.removeMember);
module.exports = router;