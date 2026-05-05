import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Saare users fetch karo
        const userRes = await axios.get(`${API_URL}/api/auth/users`, { headers });
        const allUsers = userRes.data;

  

if (currentUser?.role === 'Admin') {
    
    setMembers(allUsers);
} else {
    
    const projRes = await axios.get(`${API_URL}/api/projects`, { headers });
    const myProjects = projRes.data;

    const teamIds = new Set();
    myProjects.forEach(proj => {
        proj.members.forEach(m => {
            const id = m._id || m;
            teamIds.add(id.toString());
        });
    });

        
    const myTeam = allUsers.filter(u => 
        teamIds.has(u._id.toString()) && u.role === 'Member'
    );
    setMembers(myTeam);
}


        setLoading(false);
      } catch (err) {
        console.error("Team fetch error", err);
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [currentUser?.role]);

  const filteredSearchMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
       <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="mt-4 font-black text-blue-600 uppercase tracking-widest text-sm">Identifying Team...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen w-full font-sans">
      <div className="max-w-full mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 px-2 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none">
                {currentUser?.role === 'Admin' ? 'Personnel Directory' : 'My Team'}
            </h1>
            <p className="text-gray-400 font-bold text-sm mt-4 uppercase tracking-wider">
              {currentUser?.role === 'Admin' 
                ? `⚡ System Wide: ${members.length} Registered Users` 
                : `🤝 Connected: ${members.length} Team Members`}
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="Search team..."
              className="w-full p-4 pl-12 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 shadow-sm font-bold text-gray-700 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
          {filteredSearchMembers.map(member => (
            <div key={member._id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl transition-all duration-500 group relative">
              
              <div className={`h-20 w-20 rounded-3xl mb-6 flex items-center justify-center font-black text-3xl uppercase text-white shadow-xl ${
                member.role === 'Admin' ? 'bg-gradient-to-tr from-rose-500 to-orange-500' : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
              }`}>
                {member.name[0]}
              </div>

              <h3 className="font-black text-gray-800 text-lg truncate w-full">{member.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 mb-6 truncate w-full">{member.email}</p>
              
              <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                member.role === 'Admin' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Members;