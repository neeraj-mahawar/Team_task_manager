import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProjects(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Projects fetch failed", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 🔥 REMOVE MEMBER LOGIC
  const handleRemoveMember = async (projectId, memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the project?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/projects/remove-member`, 
        { projectId, memberId }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert("Member removed! 🚪");
      fetchProjects(); 
    } catch (err) {
      alert(err.response?.data?.msg || "Remove failed!");
    }
  };

  const calculateProgress = (projectTasks) => {
    if (!projectTasks || projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'Done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-xl font-black text-blue-600 animate-pulse uppercase tracking-widest">
        Syncing Projects...
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen w-full">
      <div className="max-w-full mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Active Projects</h1>
            <p className="text-gray-500 font-medium text-lg italic">"Control is not about being in charge, it's about making it work."</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 shadow-sm"
            />
            
            {user?.role === 'Admin' && (
              <button 
                onClick={() => navigate('/create-project')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 whitespace-nowrap uppercase text-xs tracking-widest"
              >
                + New Project
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const progress = calculateProgress(project.tasks);

              return (
                <div 
                  key={project._id} 
                  className="bg-white rounded-[2.5rem] p-7 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 text-xl font-black group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {project.name[0]}
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                      Active
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium mb-6 line-clamp-3 leading-relaxed">
                    {project.description || "Building the future, one task at a time."}
                  </p>

                  <div className="mt-auto">
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                        <span>Progress</span>
                        <span className="text-gray-900">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* 🔥 TEAM MANAGEMENT SECTION (Admin Only) */}
                    {user?.role === 'Admin' && project.members?.length > 0 && (
                      <div className="mb-6 border-t border-gray-50 pt-4">
                        <p className="text-[9px] font-black uppercase text-gray-400 mb-3 tracking-widest">Assigned Personnel</p>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                          {project.members.map((member) => (
                            <div key={member._id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 pl-2 pr-1 py-1 rounded-lg group/mem hover:border-red-100 transition-all">
                              <span className="text-[10px] font-bold text-gray-600">{member.name}</span>
                              <button 
                                onClick={() => handleRemoveMember(project._id, member._id)}
                                className="text-gray-300 hover:text-red-500 font-black text-xs px-1 transition-colors leading-none"
                                title="Kick Member"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer / Avatars */}
                    <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((member, i) => (
                          <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm" title={member.name}>
                            {member.name ? member.name[0] : 'U'}
                          </div>
                        ))}
                        {project.members?.length > 3 && (
                          <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 shadow-sm">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/projects/${project._id}`)} 
                        className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 tracking-widest"
                      >
                        Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-white p-20 text-center rounded-[3rem] border-4 border-dotted border-gray-100">
              <div className="text-6xl mb-6">📂</div>
              <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">No Operations Found</h2>
              <p className="text-gray-400 font-bold mb-6">Initialize a new project to start tracking.</p>
              {user?.role === 'Admin' && (
                <button 
                  onClick={() => navigate('/create-project')}
                  className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 uppercase text-xs tracking-widest"
                >
                  Create Your First Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;