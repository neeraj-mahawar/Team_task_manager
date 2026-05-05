const Task = require('../models/Task');
const Project = require('../models/Project');


exports.getTasks = async (req, res) => { 
  try {
    let tasks;
    const userProjects = await Project.find({ members: req.user.id }).select('_id');
const projectIds = userProjects.map(p => p._id);
    if (req.user.role === 'Admin') {
 
tasks = await Task.find({ createdBy: req.user.id })
  .populate('project', 'name')
  .populate('assignedTo', 'name'); 
   
    } else {
     
      tasks = await Task.find({ 
        $or: [
          { assignedTo: req.user.id }, 
            { project: { $in: projectIds } }
        ]
      })
      .populate('project', 'name')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');
    }

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Tasks fetch error" });
  }
};


// Create Task
exports.createTask = async (req, res) => {
  try {
   
const project = await Project.findById(req.body.project);

if (!project.members.some(m => m.toString() === req.body.assignedTo)) {
  return res.status(400).json({ msg: "User is not part of this project" });
}
    const newTask = new Task({
      ...req.body,
      createdBy: req.user.id 
    });
    
    const savedTask = await newTask.save();
    await Project.findByIdAndUpdate(req.body.project, { 
     
      $push: { tasks: savedTask._id }
    });

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Task creation error:", err);
    res.status(500).json({ error: "Could not create task" });
  }
};


exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

  
    if (
      req.user.role !== 'Admin' &&
      task.assignedTo?.toString() !== req.user.id
    ) {
      return res.status(403).json({ 
        msg: "You are not authorized to update this task's status" 
      });
    }

   
    const allowedStatus = ['To Do', 'In Progress', 'Done'];
    if (!allowedStatus.includes(req.body.status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    task.status = req.body.status;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};



exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    
    // Task dhundo aur uda do
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json({ msg: "Task successfully deleted! 🚀" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error: Delete failed." });
  }
};