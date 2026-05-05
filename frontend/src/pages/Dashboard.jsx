import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ 
  total: 0, 
  todo: 0,
  inProgress: 0,
  done: 0, 
  overdue: 0 
});
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user')) || null;
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === "undefined") { navigate('/login'); return; }

    try {
      const res = await axios.get(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const allTasks = res.data || [];
      setTasks(allTasks);

      const total = allTasks.length;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todoCount = allTasks.filter(t => t.status === 'To Do').length;
const inProgressCount = allTasks.filter(t => t.status === 'In Progress').length;
const doneCount = allTasks.filter(t => t.status === 'Done').length;
      const overdueCount = allTasks.filter(t => {
        const isNotDone = t.status !== 'Done';
        const isPastDue = t.dueDate && new Date(t.dueDate) < today;
        return isNotDone && isPastDue;
      }).length;

      const uStats = {};
      allTasks.forEach(task => {
        const name = task.assignedTo?.name || "Unassigned";
        uStats[name] = (uStats[name] || 0) + 1;
      });
      setUserStats(uStats);

      setStats({ 
  total, 
  todo: todoCount,
  inProgress: inProgressCount,
  done: doneCount, 
  overdue: overdueCount 
});
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [navigate]);

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/tasks/${id}/status`, 
        { status: newStatus }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) { alert("Status update failed!"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) { alert("Delete failed!"); }
  };

  if (loading) return <div className="flex justify-center items-center h-screen font-bold text-blue-600 uppercase tracking-widest">Loading TeamTask AI Dashboard...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen w-full">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dashboard Overview</h1>
          <p className="text-gray-500 font-bold">Welcome back, <span className="text-blue-600">{user?.name}</span></p>
        </div>
        {user?.role === 'Admin' && (
          <div className="flex gap-3">
            <button onClick={() => navigate('/create-project')} className="bg-white border p-3 rounded-xl font-bold hover:bg-gray-100 shadow-sm transition-all">+ Project</button>
            <button onClick={() => navigate('/create-task')} className="bg-blue-600 text-white p-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">+ Create Task</button>
          </div>
        )}
      </div>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
  <StatCard title="Total Tasks" value={stats.total} color="blue" />
  <StatCard title="To Do" value={stats.todo} color="gray" />
  <StatCard title="In Progress" value={stats.inProgress} color="yellow" />
  <StatCard title="Completed" value={stats.done} color="green" />
  <StatCard title="Overdue" value={stats.overdue} color="red" />
</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b font-black text-gray-800 uppercase text-xs tracking-widest">Recent Activity Log</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                <tr>
                  <th className="p-5">Task Details</th>
                  <th className="p-5">Assigned To</th>
                  <th className="p-5">Status</th>
                  {user?.role === 'Admin' && <th className="p-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => {
                  // logic checks
                  const taskAssignedId = task.assignedTo?._id || task.assignedTo;
                  const loggedInUserId = user?._id || user?.id;
                 
                  const showDropdown = user?.role === 'Member' && 
                                       taskAssignedId && 
                                       taskAssignedId.toString() === loggedInUserId?.toString();

                  return (
                    <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-gray-800">{task.title}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">📁 {task.project?.name || 'General'}</div>
                      </td>
                      <td className="p-5 text-sm font-semibold text-gray-600">
                        {task.assignedTo?.name || "Unassigned"}
                      </td>
                      <td className="p-5">
                        {showDropdown ? (
                       <div className="relative inline-block">
  <select 
    value={task.status} 
    onChange={(e) => updateTaskStatus(task._id, e.target.value)} 
    className={`appearance-none text-[10px] font-black uppercase tracking-widest px-4 py-2 pr-10 rounded-xl border-2 transition-all duration-300 cursor-pointer outline-none shadow-sm
      ${task.status === 'Done' 
        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:border-emerald-300' 
        : task.status === 'In Progress' 
          ? 'bg-amber-50 border-amber-100 text-amber-600 hover:border-amber-300' 
          : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
      } focus:ring-4 focus:ring-blue-50`}
  >
    <option value="To Do">To Do</option>
    <option value="In Progress">In Progress</option>
    <option value="Done">Done</option>
   </select>
  

  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
    <svg 
      className={`w-3 h-3 ${task.status === 'Done' ? 'text-emerald-400' : 'text-gray-300'}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
                        ) : (
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            task.status === 'Done' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {task.status}
                          </span>
                        )}
                      </td>
                      {user?.role === 'Admin' && (
                        <td className="p-5 text-right">
                          <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:text-red-600 font-bold text-[10px] uppercase">Delete</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Team Productivity</h2>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg">Live</span>
          </div>
          <div className="space-y-7">
            {Object.keys(userStats).length > 0 ? (
              Object.entries(userStats)
                .filter(([name]) => name !== "Unassigned" && name !== "Not Assigned")
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <div key={name} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                          {name[0].toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 text-sm block leading-none mb-1">{name}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Contributor</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-gray-900 block">{count}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tasks</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-400 text-sm font-bold italic">No data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = { blue: 'border-blue-500', yellow: 'border-yellow-400', green: 'border-emerald-500', red: 'border-red-500', gray: 'border-gray-400' };
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-[6px] ${colors[color]} hover:-translate-y-1 transition-all`}>
      <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">{title}</p>
      <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
    </div>
  );
};

export default Dashboard;