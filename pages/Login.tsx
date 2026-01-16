
import React, { useState } from 'react';
import { AuthUser } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  users: AuthUser[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    
    if (isAdminMode) {
      if (identifier === 'arvin_hanif' && password === 'arvin_hanif') {
        const adminUser: AuthUser = {
          id: 'admin-01',
          role: 'Admin',
          name: 'Arvin Hanif',
          username: 'arvin_hanif',
          mobile: '01XXXXXXXXX',
          email: 'arvin@warrick.io'
        };
        onLogin(adminUser);
      } else {
        setError('INVALID ADMIN CREDENTIALS');
      }
    } else {
      const foundUser = users.find(u => 
        (u.username === identifier || u.mobile === identifier || u.email === identifier) && 
        (u as any).password === password
      );
      
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('INVALID CREDENTIALS');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F0F2F5] dark:bg-[#0F1012] font-sans">
      
      {/* Branding Header - Precise Matching */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="relative mb-2">
          <h1 className="text-[48px] font-black tracking-[-0.05em] text-[#2D364E] dark:text-white leading-none">
            WARRICK<span className="text-[#6366F1]">.</span>
          </h1>
          <div className="w-10 h-[3px] bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto mt-2"></div>
        </div>
        
        <div className="bg-[#EBEEF2] dark:bg-white/5 px-5 py-1.5 rounded-full shadow-sm">
          <p className="text-[9px] font-black text-[#8E9AAF] dark:text-gray-400 uppercase tracking-[0.25em]">
            POWERED BY ARVIN
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-[410px] p-10 space-y-9 bg-[#F0F2F5] dark:bg-[#1A1C1E] rounded-[54px] shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] dark:shadow-none">
        
        <div className="space-y-5">
          {/* Identity Input */}
          <div className="sunken-well px-8 h-[62px] flex items-center shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] dark:shadow-none">
            <input
              type="text"
              placeholder={isAdminMode ? "Admin ID" : "Email or Mobile"}
              className="bg-transparent w-full outline-none font-semibold text-[#8E9AAF] dark:text-white placeholder:text-[#A0AABF] text-[16px]"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="sunken-well px-8 h-[62px] flex items-center shadow-[inset_6px_6px_12px_#d1d9e6,inset_-6px_-6px_12px_#ffffff] dark:shadow-none">
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent w-full outline-none font-semibold text-[#8E9AAF] dark:text-white placeholder:text-[#A0AABF] text-[16px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Primary Action Button - White/Light Grey with Liquid Glass Effect */}
        <button 
          onClick={handleLogin}
          className="relative overflow-hidden w-full h-[64px] rounded-[24px] bg-[#EBEEF2] text-[#2D364E] font-bold text-[18px] border-2 border-white shadow-[6px_6px_12px_#c2cad6,-6px_-6px_12px_#ffffff] active:shadow-inner active:scale-[0.98] transition-all flex items-center justify-center group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/5 pointer-events-none"></div>
          <div className="absolute inset-0 shadow-[inset_0px_1px_2px_rgba(255,255,255,0.8)] pointer-events-none"></div>
          <span className="relative z-10">{isAdminMode ? 'Admin Sign In' : 'Sign In'}</span>
        </button>

        {error && (
          <p className="text-center text-[10px] font-black text-red-500 uppercase tracking-widest">
            {error}
          </p>
        )}

        {/* Separator Line */}
        <div className="w-full h-[1px] bg-gray-200/50 dark:bg-white/5"></div>

        {/* Bottom Navigation Section */}
        <div className="flex flex-col items-center">
          {/* Admin Portal Toggle - Liquid Glass Effect */}
          <button 
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError('');
            }}
            className="relative overflow-hidden px-10 py-3 bg-[#EBEEF2] dark:bg-white/5 border border-white rounded-full text-[10px] font-black text-[#2D364E] dark:text-gray-400 uppercase tracking-[0.2em] shadow-sm hover:opacity-80 transition-opacity"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50"></div>
            <span className="relative z-10">{isAdminMode ? 'USER PORTAL' : 'ADMIN PORTAL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
