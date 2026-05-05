import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        
        const allTasks = res.data;
        if (user?.role === 'Admin') {
          setTasks(allTasks);
        } else {
          const myOnlyTasks = allTasks.filter(t => 
            (t.assignedTo?._id || t.assignedTo)?.toString() === (user?._id || user?.id)?.toString()
          );
          setTasks(myOnlyTasks);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Tasks fetch error", err);
        setLoading(false);
      }
    };
    fetchTasks();
  }, [navigate, token]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/tasks/${id}/status`, { status: newStatus }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert("Status update failed!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 text-2xl font-black text-blue-600 animate-pulse uppercase tracking-widest">
      Loading Task Board...
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen w-full">
      <div className="max-w-full mx-auto">
        
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              {user?.role === 'Admin' ? "Team Activity Monitor" : "My Task Board"}
            </h1>
            <p className="text-gray-500 font-bold text-lg mt-2 flex items-center gap-2">
              <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
              {user?.role === 'Admin' ? "Watching all team assignments" : `Showing ${tasks.length} tasks assigned to you`}
            </p>
          </div>
          
          <div className="bg-white px-8 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Task Count</p>
                <p className="text-2xl font-black text-blue-600">{tasks.length}</p>
             </div>
          </div>
        </div>

       
        <div className="flex flex-col gap-6">
          {tasks.length > 0 ? tasks.map(task => {
       
            const isMyTask = (task.assignedTo?._id || task.assignedTo)?.toString() === (user?._id || user?.id)?.toString();
            const canEdit = user?.role !== 'Admin' && isMyTask;

            return (
              <div 
                key={task._id} 
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:shadow-2xl hover:border-blue-200 transition-all duration-500 group"
              >
                <div className="flex-1 w-full pl-2">
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <h3 className="font-black text-2xl text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">
                      {task.title}
                    </h3>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] border ${
                      task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4">

  <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100 group-hover:bg-white transition-all">
    <span className="text-xs opacity-70">📁</span>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
      {task.project?.name || 'Main Workspace'}
    </p>
  </div>

  <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100 group-hover:bg-white transition-all">
    <div className="h-5 w-5 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[9px] font-black">
      {task.assignedTo?.name?.[0] || 'U'}
    </div>
    <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
      <span className="text-gray-400 mr-1 font-bold">Assigned to:</span> 
      <span className="text-blue-600">{task.assignedTo?.name || 'You'}</span>
    </p>
  </div>
</div>
                </div>

      
                <div className="flex items-center justify-between w-full md:w-auto gap-12 border-t md:border-t-0 pt-6 md:pt-0">
                  <div className="text-left md:text-right min-w-[140px]">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1">Live Status</p>
                    <p className={`text-xl font-black uppercase tracking-tighter ${
                      task.status === 'Done' ? 'text-emerald-500' : 'text-amber-500'
                    }`}>
                      {task.status}
                    </p>
                  </div>

                  {canEdit ? (
                   <div className="relative group">
  <select 
    value={task.status} 
    onChange={(e) => updateStatus(task._id, e.target.value)}
    className={`p-5 min-w-[180px] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 outline-none transition-all duration-500 shadow-sm cursor-pointer appearance-none
      ${task.status === 'Done' 
        ? 'bg-[#ECFDF5] border-[#D1FAE5] text-[#059669] hover:border-[#10B981] hover:shadow-lg hover:shadow-emerald-500/10' 
        : task.status === 'In Progress' 
          ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#D97706] hover:border-[#FBBF24] hover:shadow-lg hover:shadow-amber-500/10' 
          : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
      } focus:ring-4 focus:ring-opacity-20 ${task.status === 'Done' ? 'focus:ring-emerald-400' : 'focus:ring-blue-400'}`}
  >
    <option value="To Do" className="bg-white text-gray-900">○ TO DO</option>
    <option value="In Progress" className="bg-white text-amber-600">◐ IN PROGRESS</option>
    <option value="Done" className="bg-white text-emerald-600">● DONE</option>
  </select>

 
  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
    <span className="text-[6px] leading-none">▲</span>
    <span className="text-[6px] leading-none">▼</span>
  </div>
</div>
                  ) : (
                   
                    <div className="p-5 min-w-[180px] rounded-2xl bg-gray-50 border-2 border-gray-100 text-center flex flex-col justify-center">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">
                          {user?.role === 'Admin' ? "Monitor Only" : "Read Only"}
                       </span>
                    </div>
                  )}
                </div>  
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-40 bg-white rounded-[3.5rem] border-4 border-dotted border-gray-100">
               <p className="text-gray-300 font-black text-4xl uppercase tracking-tighter">No Tasks For You</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;