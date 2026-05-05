
  const Project = require('../models/Project');
  const User = require('../models/User'); 
  const Task = require('../models/Task');
 

  exports.createProject = async (req, res) => {
      try {
         
          const { name, description, members = [] } = req.body;
          const validUsers = await User.find({ _id: { $in: members } });

  if (validUsers.length !== members.length) {
    return res.status(400).json({ msg: "Invalid members selected" });
  }
          if (members.length === 0) {
    return res.status(400).json({ msg: "At least one member required" });
  }
          const existingProject = await Project.findOne({ name });
          if (existingProject) return res.status(400).json({ msg: "Project name already taken" });

          const newProject = new Project({
              name,
              description,
              admin: req.user.id, 
              members: [...new Set([...members, req.user.id])] 
          });
          
          await newProject.save();
          res.status(201).json(newProject);
      } catch (err) {
          console.error(err);
          res.status(500).json({ msg: "Project creation error" });
      }
  };


  exports.addMember = async (req, res) => {
      try {
          const { projectId, memberId } = req.body;
          
      
          const userExists = await User.findById(memberId);
          if (!userExists) return res.status(404).json({ msg: "User not found" });

          const project = await Project.findById(projectId);
          if (!project) return res.status(404).json({ msg: "Project not found" });

          if (project.admin.toString() !== req.user.id) {
              return res.status(403).json({ msg: "Only Admin can add members" });
          }

          if (!project.members.some(m => m.toString() === memberId)){
              project.members.push(memberId);
              await project.save();
          }
          res.json({ msg: "Member added successfully", project });
      } catch (err) {
          res.status(500).json({ msg: "Error adding member" });
      }
  };

 
  exports.getProjects = async (req, res) => {
    try {
      let projects;
      
      if (req.user.role === 'Admin') {
       
        projects = await Project.find({ admin: req.user.id })
          .populate({
  path: 'tasks',
  select: 'title status dueDate'
})
          .populate('members', 'name email');
          
      } else {
        
        projects = await Project.find({ 
          members: { $in: [req.user.id] } 
        })
        .populate({
  path: 'tasks',
  select: 'title status dueDate'
})
        .populate('members', 'name email');
      }

      res.json(projects);
    } catch (err) {
      console.error("Fetch Projects Error:", err);
      res.status(500).json({ msg: "Server Error: Projects fetch nahi ho paye" });
    }
  };

  
  exports.removeMember = async (req, res) => {
    try {
      const { projectId, memberId } = req.body;
      const project = await Project.findById(projectId);
      if (!project) {
    return res.status(404).json({ msg: "Project not found" });
  }
      if (project.admin.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Only Admin can remove members" });
      }

      if (memberId === project.admin.toString()) {
        return res.status(400).json({ msg: "Admin cannot be removed" });
      }

      project.members = project.members.filter(m => m.toString() !== memberId);
      await project.save();
    
await Task.updateMany(
  { assignedTo: memberId, project: projectId },
  { $set: { assignedTo: null } }
);
      res.json({ msg: "Member removed", project });
    } catch (err) {
      res.status(500).json({ msg: "Remove member error" });
    }
  };

  exports.getDashboardStats = async (req, res) => {
    try {
      let tasks;

      if (req.user.role === 'Admin') {
        tasks = await Task.find({ createdBy: req.user.id })
          .populate('assignedTo', 'name');
      } else {
        tasks = await Task.find({ assignedTo: req.user.id })
          .populate('assignedTo', 'name');
      }

      const userStats = {};
      tasks.forEach(task => {
        const userName = task.assignedTo?.name || "Unassigned";
        userStats[userName] = (userStats[userName] || 0) + 1;
      });

      const totalTasks = tasks.length;
            res.json({
  totalTasks,
  userStats
});

    } catch (err) {
      res.status(500).json({ message: "Stats error" });
    }
  };