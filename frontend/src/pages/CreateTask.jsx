import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateTask = () => {
  const [taskData, setTaskData] = useState({ 
    title: '', 
    priority: 'Medium', 
    assignedTo: '', 
    project: '', 
    dueDate: '' 
  });
  
  const [users, setUsers] = useState([]); 
  const [projects, setProjects] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const [resUsers, resProjects] = await Promise.all([
          axios.get(`${API_URL}/api/auth/users`, config),
          axios.get(`${API_URL}/api/projects`, config)
        ]);
        
        setUsers(resUsers.data);
        setProjects(resProjects.data);
        setLoading(false);
      } catch (err) {
        console.error("Data load error:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);


 useEffect(() => {
  if (taskData.project && projects.length > 0) {
    const selectedProj = projects.find(p => p._id === taskData.project);
    
    if (selectedProj && selectedProj.members) {
     
      const membersInProject = users.filter(u => 
        u.role !== 'Admin' && 
        selectedProj.members.some(mId => 
          (mId._id || mId).toString() === u._id.toString()
        )
      );
      
      setFilteredUsers(membersInProject);
      
    
      setTaskData(prev => ({ ...prev, assignedTo: '' }));
    }
  } else {
    setFilteredUsers([]);
  }
}, [taskData.project, projects, users]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedDate = new Date(taskData.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (selectedDate < today) {
      alert("Please select a valid due date (today or future)!");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/tasks/create`, taskData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Task Assigned! 🎯");
      navigate('/dashboard'); 
    } catch (err) {
      alert(err.response?.data?.msg || "Task creation failed");
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 uppercase tracking-widest font-black text-blue-600 text-[10px]">
       Syncing System...
    </div>
  );

  return (
    <div className="p-4 md:p-12 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-xl border border-gray-100">
        
        <div className="mb-10 text-center">
          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full uppercase tracking-widest">Task Orchestrator</span>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mt-4">Assign Mission</h2>
          <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-tight">Delegate tasks to your team members</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Definition</label>
            <input 
              type="text" required
              placeholder="e.g. Optimize API Endpoints" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700"
              onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Linked Project</label>
              <select 
                required
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700 cursor-pointer"
                onChange={(e) => setTaskData({...taskData, project: e.target.value})}
              >
                <option value="">Select Project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>


            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Responsible Operator</label>
              <select 
                required
                value={taskData.assignedTo}
                disabled={!taskData.project}
                className={`w-full p-4 border-2 rounded-2xl outline-none font-bold transition-all ${!taskData.project ? 'bg-gray-100 border-gray-100 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700 focus:border-blue-500'}`}
                onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
              >
                <option value="">{taskData.project ? "Choose Member" : "Select Project First"}</option>
                {filteredUsers.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700"
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deadline</label>
              <input 
                type="date" required
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-gray-700"
                onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-blue-700 uppercase tracking-[0.2em] text-xs transition-all active:scale-95"
            >
              Confirm & Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;