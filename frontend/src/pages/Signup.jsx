import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Member',
    adminKey: '' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/signup`, formData);
      setLoading(false);
      alert("Registration Successful! Mission Control is ready. Please Login.");
      navigate('/login');
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.msg || "Registration failed! Details check karo.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden">
      
    
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-3xl opacity-60 animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>

      <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] w-full max-w-lg border border-gray-100 relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 border border-blue-100">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">New Personnel</h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Join the collaborative network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Identity</label>
              <input 
                type="text" required
                placeholder="John Doe" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Channel</label>
              <input 
                type="email" required
                placeholder="name@company.com" 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Access Password</label>
            <input 
              type="password" required
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-bold text-gray-700" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Designated Role</label>
            <div className="relative">
              <select 
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 appearance-none font-bold text-gray-700 cursor-pointer"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                value={formData.role}
              >
                <option value="Member">Member (Join Teams)</option>
                <option value="Admin">Admin (Full Control)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

        
          {formData.role === 'Admin' && (
            <div className="space-y-2 animate-in slide-in-from-top duration-300">
              <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">Admin Verification Key</label>
              <input 
                type="password" 
                required
                placeholder="Enter Secret Admin Code" 
                className="w-full p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl outline-none focus:border-rose-500 font-bold text-gray-700 placeholder:text-rose-200" 
                onChange={(e) => setFormData({...formData, adminKey: e.target.value})} 
              />
              <p className="text-[9px] text-rose-400 font-bold italic ml-1">*Required for Admin privileges</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98] ${
              loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            {loading ? 'Initializing...' : 'Finalize Registration'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">
            Already authorized? <Link to="/login" className="text-blue-600 hover:underline ml-1">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;