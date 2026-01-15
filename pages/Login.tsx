
import React, { useState } from 'react';
import { AuthUser } from '../types';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
  users: AuthUser[];
}

type AuthView = 'login' | 'admin';

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [view, setView] = useState<AuthView>('login');
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleAction = () => {
    setError('');
    
    // Find user in the users list
    const foundUser = users.find(u => 
      (u.username === formData.identifier || (u as any).mobile === formData.identifier) && 
      (u as any).password === formData.password
    );

    if (foundUser) {
      if (view === 'admin' && foundUser.role !== 'Admin') {
        setError('This portal is restricted to Administrators.');
        return;
      }
      onLogin(foundUser);
    } else {
      setError('Access Denied. Invalid credentials.');
    }
  };

  const renderInputs = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-ios-gray ml-4 uppercase tracking-[0.2em] block mb-1">
            {view === 'admin' ? 'Admin ID' : 'Email or Mobile'}
          </label>
          <input
            type="text"
            className="w-full bg-ios-bg border-none rounded-full px-8 py-4 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-gray-800 placeholder:text-gray-400/30 text-sm shadow-sm"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-ios-gray ml-4 uppercase tracking-[0.2em] block mb-1">Password</label>
          <input
            type="password"
            className="w-full bg-ios-bg border-none rounded-full px-8 py-4 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-gray-800 placeholder:text-gray-400/30 text-sm shadow-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ios-bg p-6 font-sans">
      {/* Brand Header */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <h1 className="text-[52px] font-black tracking-tighter text-[#1A237E] leading-none mb-3">
          WARRICK<span className="text-[#6200EA]">.</span>
        </h1>
        <div className="flex flex-col items-center">
           <div className="w-12 h-[1.5px] bg-blue-500/40 rounded-full mb-3"></div>
           <div className="bg-white/90 ios-blur border border-white px-5 py-2 rounded-full shadow-sm">
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
               POWERED BY ARVIN
             </p>
           </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-[440px] bg-white rounded-[50px] p-10 md:p-12 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border border-white/40 animate-in zoom-in-95 duration-500">
        
        <div className="space-y-8">
          {renderInputs()}

          {error && (
            <div className="bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-3 rounded-full border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <button 
            onClick={handleAction}
            className="w-full py-5 rounded-full text-white font-black text-sm uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all bg-[#424242] hover:bg-black"
          >
            {view === 'admin' ? 'Authorize' : 'Sign In'}
          </button>

          {/* Navigation Options */}
          <div className="flex flex-col items-center space-y-6 pt-4 border-t border-gray-100">
            {view === 'login' ? (
              <button 
                onClick={() => { setView('admin'); setError(''); }}
                className="bg-white px-10 py-3 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border border-gray-100 hover:text-black hover:border-black transition-all"
              >
                Admin Portal
              </button>
            ) : (
              <div className="bg-ios-bg/40 p-1.5 rounded-full flex items-center border border-white shadow-sm">
                <span className="text-[9px] font-bold text-gray-400 px-4 uppercase">Mistake?</span>
                <button 
                  onClick={() => { setView('login'); setError(''); }}
                  className="bg-white text-blue-600 text-[9px] font-black px-6 py-2.5 rounded-full uppercase tracking-wider shadow-sm border border-blue-50 transition-all hover:bg-blue-600 hover:text-white"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
