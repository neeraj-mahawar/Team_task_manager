const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth, checkAdmin } = require('../middleware/auth');



router.get('/', auth, taskController.getTasks); 



router.post('/create', auth, checkAdmin, taskController.createTask);



router.put('/:id/status', auth, taskController.updateTaskStatus);
router.delete('/:id', auth, checkAdmin, taskController.deleteTask);
module.exports = router;