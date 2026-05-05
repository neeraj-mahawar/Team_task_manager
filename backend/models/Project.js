const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Project name is required'], 
    trim: true 
  },
 description: { 
    type: String, 
    required: false, 
    default: ''    
  },
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  tasks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  }]
}, { timestamps: true }); 
module.exports = mongoose.model('Project', ProjectSchema);