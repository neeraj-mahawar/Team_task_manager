import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateProject = () => {
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUsers(res.data.filter(u => u.role === 'Member'));
        setFetchingUsers(false);
      } catch (err) {
        setFetchingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (userId) => {
    setFormData(prev => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected 
          ? prev.members.filter(id => id !== userId) 
          : [...prev.members, userId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.members.length === 0) {
      alert("Please add at least one member to the project!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/projects/create` , formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert("Project Created! 🚀");
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.msg || "Project creation failed!");
    }
  };

  return (
    <div className="p-4 md:p-12 bg-[#F8FAFC] min-h-screen flex justify-center items-center font-sans">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-gray-100 relative overflow-hidden">
        
        <div className="text-center mb-8">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] bg-blue-50/50 px-4 py-2 rounded-full border border-blue-100">
            Project Architect
          </span>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mt-4 leading-none">
            New Workspace
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Project Identity</label>
            <input 
              type="text" required
              placeholder="e.g. AI Content Strategy 2024"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-700 transition-all shadow-inner placeholder:text-gray-300"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>


          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Workspace Goal & Vision</label>
                <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tight italic">Visible to all members</span>
            </div>
            <textarea 
              rows="4"
              required
              placeholder="Define the mission objectives... (e.g. We need to build a prototype for the client by next month using MERN stack)"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-semibold text-gray-600 transition-all shadow-inner resize-none placeholder:text-gray-300"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>


          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assemble Team</label>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{formData.members.length} Operators Selected</span>
            </div>
            
            <input 
              type="text"
              placeholder="🔍 Search personnel name..."
              className="w-full p-3 bg-white border-2 border-blue-100 rounded-xl outline-none focus:border-blue-400 text-sm font-bold shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />


            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto py-1 custom-scrollbar">
               {formData.members.map(mId => {
                 const member = users.find(u => u._id === mId);
                 return (
                   <div key={mId} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-md border border-blue-400">
                     {member?.name}
                     <button type="button" onClick={() => toggleMember(mId)} className="hover:text-red-300 font-bold text-sm leading-none">×</button>
                   </div>
                 )
               })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar border-t border-gray-50 pt-4">
              {fetchingUsers ? (
                <div className="col-span-full py-5 text-center text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing Directory...</div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const isSelected = formData.members.includes(u._id);
                  return (
                    <div 
                      key={u._id} 
                      onClick={() => toggleMember(u._id)}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-50 bg-gray-50 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'}`}>
                          {u.name?.[0].toUpperCase()}
                        </div>
                        <span className={`text-[11px] font-black uppercase ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{u.name}</span>
                      </div>
                      {isSelected && <div className="h-2 w-2 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-5 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Target personnel not found</div>
              )}
            </div>
          </div>

          
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button type="button" onClick={() => navigate('/dashboard')} className="p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">Abord Mission</button>
            <button type="submit" disabled={loading} className={`p-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all ${loading ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
              {loading ? 'Initializing...' : 'Launch Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;