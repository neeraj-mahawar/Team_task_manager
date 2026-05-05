import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  // Active link check (Spaces fix kar diye hain)
  const isActive = (path) => location.pathname === path ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "hover:bg-gray-800 text-gray-400 hover:text-white";

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 text-2xl font-black border-b border-gray-800 tracking-tighter ">
        Team Task <span className="text-blue-500 underline decoration-2 underline-offset-4"></span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-6">
        <Link to="/" className={`flex items-center py-3 px-4 rounded-xl font-bold transition-all duration-200 ${isActive('/')}`}>
          <span className="mr-3 text-lg">🏠</span> Dashboard
        </Link>
        
        <Link to="/projects" className={`flex items-center py-3 px-4 rounded-xl font-bold transition-all duration-200 ${isActive('/projects')}`}>
          <span className="mr-3 text-lg">📁</span> Projects
        </Link>
        
        <Link to="/my-tasks" className={`flex items-center py-3 px-4 rounded-xl font-bold transition-all duration-200 ${isActive('/my-tasks')}`}>
          <span className="mr-3 text-lg">✅</span> My Tasks
        </Link>
        
        {/* 🔥 Yahan space fix kiya hai: '/members' */}
        <Link to="/members" className={`flex items-center py-3 px-4 rounded-xl font-bold transition-all duration-200 ${isActive('/members')}`}>
          <span className="mr-3 text-lg">👥</span> Team Members
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full bg-red-600/10 text-red-500 border border-red-900/30 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
        >
          Logout Session
        </button>
      </div>
    </div>
  );
};

export default Sidebar;