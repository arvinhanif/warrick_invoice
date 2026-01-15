
import React, { useState, useRef } from 'react';
import { BusinessInfo, AuthUser } from '../types';

interface SettingsProps {
  business: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
  onLogout: () => void;
  user: AuthUser;
  onRegisterUser: (newUser: AuthUser) => void;
  users: AuthUser[];
  onUpdateUser?: (updatedUser: AuthUser) => void;
  onDeleteUser?: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ business, onUpdate, onLogout, user, onRegisterUser, users, onUpdateUser, onDeleteUser }) => {
  const [formData, setFormData] = useState<BusinessInfo>(business);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New User Registration & Editing State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newUserInfo, setNewUserInfo] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'Staff' as 'Staff' | 'Admin'
  });
  const [regSuccess, setRegSuccess] = useState(false);

  const isAdmin = user.role === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newUserInfo.name || !newUserInfo.password) return;

    if (isEditing) {
      if (onUpdateUser) {
        onUpdateUser({
          id: isEditing,
          name: newUserInfo.name,
          username: newUserInfo.email || newUserInfo.mobile,
          mobile: newUserInfo.mobile,
          email: newUserInfo.email,
          password: newUserInfo.password,
          role: newUserInfo.role
        });
      }
      setIsEditing(null);
    } else {
      onRegisterUser({
        id: `user-${Date.now()}`,
        role: newUserInfo.role,
        name: newUserInfo.name,
        username: newUserInfo.email || newUserInfo.mobile,
        mobile: newUserInfo.mobile,
        email: newUserInfo.email,
        password: newUserInfo.password
      });
    }

    setNewUserInfo({ name: '', email: '', mobile: '', password: '', role: 'Staff' });
    setRegSuccess(true);
    setTimeout(() => setRegSuccess(false), 3000);
  };

  const startEditUser = (u: AuthUser) => {
    setIsEditing(u.id);
    setNewUserInfo({
      name: u.name,
      email: u.email || '',
      mobile: u.mobile || '',
      password: u.password || '',
      role: u.role
    });
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h1 className="text-[34px] font-black tracking-tighter text-[#1F2937] leading-none mb-3">
            WARRICK<span className="text-black">.</span>
          </h1>
          <div className="relative inline-block group">
             <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-[1.5px] bg-gradient-to-r from-transparent via-black to-transparent rounded-full mb-1"></div>
             <div className="bg-white/60 ios-blur px-4 py-1.5 rounded-full ios-shadow border border-white/40 mt-0.5">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">
                  POWERED BY ARVIN
                </p>
             </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center space-x-6">
              {saved && (
                  <span className="text-green-500 font-bold text-sm flex items-center animate-in fade-in slide-in-from-right-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Preferences Updated
                  </span>
              )}
              <button
                  form="settings-form"
                  type="submit"
                  className="neu-button px-12 py-4 rounded-full font-black text-xs uppercase tracking-widest text-gray-700 hover:text-black"
              >
                  Save Business Profile
              </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* User Account Section - NOW CENTERED */}
          <div className="neu-flat p-12 rounded-ios-lg border border-white/40 flex flex-col items-center text-center space-y-8">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg font-black text-4xl text-blue-600 mb-6 border-4 border-white">
                {user.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-3xl text-gray-800 tracking-tight">{user.name}</h4>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{user.role} ACCESS • @{user.username}</p>
              </div>
            </div>
            
            <div className="w-full h-px bg-ios-separator/20 max-w-[200px]"></div>

            <button 
              onClick={onLogout}
              className="px-10 py-4 bg-red-50 text-red-500 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              Log out Session
            </button>
          </div>

          {/* Account Overview Stats - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-2 duration-700">
               <div className="neu-flat p-8 rounded-ios border border-white/20 flex flex-col items-center justify-center text-center">
                  <div className="neu-circle-blue w-14 h-14 mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Registered Accounts</p>
                  <h3 className="text-3xl font-black text-gray-800">{users.length}</h3>
               </div>
               <div className="neu-flat p-8 rounded-ios border border-white/20 flex flex-col items-center justify-center text-center">
                  <div className="neu-circle-green w-14 h-14 mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Admin Access</p>
                  <h3 className="text-3xl font-black text-gray-800">{users.filter(u => u.role === 'Admin').length}</h3>
               </div>
            </div>
          )}

          {/* Registration / Editing Section - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="neu-flat p-10 rounded-ios-lg border border-white/40 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-1.5 h-6 ${isEditing ? 'bg-orange-500' : 'bg-[#6200EA]'} rounded-full`}></div>
                  <h3 className="font-black text-gray-800 uppercase text-[12px] tracking-[0.3em]">
                    {isEditing ? 'Update Existing User' : 'Register New User'}
                  </h3>
                </div>
                <div className="flex items-center space-x-4">
                  {isEditing && (
                    <button 
                      onClick={() => {
                        setIsEditing(null);
                        setNewUserInfo({ name: '', email: '', mobile: '', password: '', role: 'Staff' });
                      }}
                      className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest"
                    >
                      Cancel Edit
                    </button>
                  )}
                  {regSuccess && <span className="text-[10px] font-black text-green-500 uppercase">Operation Successful!</span>}
                </div>
              </div>

              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={newUserInfo.name}
                    onChange={(e) => setNewUserInfo({ ...newUserInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">Mobile / Gmail</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={newUserInfo.mobile}
                    onChange={(e) => setNewUserInfo({ ...newUserInfo, mobile: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">Password</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-gray-800 text-sm"
                    value={newUserInfo.password}
                    onChange={(e) => setNewUserInfo({ ...newUserInfo, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">User Role</label>
                  <select
                    className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-gray-800 text-sm appearance-none"
                    value={newUserInfo.role}
                    onChange={(e) => setNewUserInfo({ ...newUserInfo, role: e.target.value as any })}
                  >
                    <option value="Staff">Staff (Regular)</option>
                    <option value="Admin">Admin (Full Control)</option>
                  </select>
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    className={`w-full ${isEditing ? 'bg-orange-600' : 'bg-black'} text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-md`}
                  >
                    {isEditing ? 'Update Credentials' : 'Generate Account Credentials'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User List - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="neu-flat p-10 rounded-ios-lg border border-white/40 space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-1.5 h-6 bg-black rounded-full"></div>
                <h3 className="font-black text-gray-800 uppercase text-[12px] tracking-[0.3em]">Manage Users</h3>
              </div>
              
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="p-6 bg-white/50 rounded-ios border border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-ios-bg flex items-center justify-center font-black text-gray-400">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-800">{u.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.role} • {u.mobile || u.email || 'No ID'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => startEditUser(u)}
                        className="p-2 rounded-full hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-all"
                        title="Edit User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button 
                        onClick={() => onDeleteUser && onDeleteUser(u.id)}
                        className="p-2 rounded-full hover:bg-red-50 text-red-400 hover:text-red-600 transition-all"
                        title="Delete User"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business Profile - ONLY FOR ADMIN */}
          {isAdmin && (
            <div className="neu-flat p-10 rounded-ios-lg border border-white/40">
              <form id="settings-form" onSubmit={handleSubmit} className="space-y-10">
                <div className="flex items-center space-x-3">
                  <div className="w-1.5 h-6 bg-black rounded-full"></div>
                  <h3 className="font-black text-gray-800 uppercase text-[12px] tracking-[0.3em]">Business Profile</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-2">Legal Business Name</label>
                    <input
                      type="text"
                      className="w-full bg-ios-bg/50 border-none rounded-ios px-5 py-4 focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold text-gray-900"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-2">Billing Email</label>
                    <input
                      type="email"
                      className="w-full bg-ios-bg/50 border-none rounded-ios px-5 py-4 focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-2">Support Phone</label>
                    <input
                      type="text"
                      className="w-full bg-ios-bg/50 border-none rounded-ios px-5 py-4 focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-2">Physical Address</label>
                    <textarea
                      className="w-full bg-ios-bg/50 border-none rounded-ios px-5 py-4 focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all font-medium min-h-[140px] resize-none leading-relaxed"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="space-y-6">
            <div className="neu-flat p-10 rounded-ios-lg border border-white/40 flex flex-col items-center">
              <div className="w-full flex items-center space-x-3 mb-10">
                <div className="w-1.5 h-6 bg-black rounded-full"></div>
                <h3 className="font-black text-gray-800 uppercase text-[12px] tracking-[0.3em]">Brand Identity</h3>
              </div>

              <div 
                onClick={() => isAdmin && fileInputRef.current?.click()}
                className="w-full aspect-square bg-ios-bg/30 rounded-[32px] flex items-center justify-center border-2 border-dashed border-ios-separator/40 cursor-pointer overflow-hidden group relative transition-all hover:bg-white/80 hover:border-black/20 neu-pressed active:scale-95"
              >
                  {formData.logo ? (
                    <img src={formData.logo} alt="Business Logo" className="w-full h-full object-contain p-8 animate-in fade-in duration-500" />
                  ) : (
                    <div className="flex flex-col items-center space-y-4 text-ios-gray group-hover:text-black transition-colors">
                      <div className="neu-circle w-20 h-20 bg-ios-bg shadow-lg">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] block">Add Logo</span>
                        <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1 block">PNG, JPG, SVG</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                  />
              </div>
              
              <div className="mt-8 text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Master Asset</p>
                  <p className="text-[10px] text-ios-gray font-medium leading-relaxed max-w-[200px] mx-auto opacity-70">This signature mark will be rendered on all high-fidelity exports.</p>
                </div>
                
                {formData.logo && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, logo: undefined})}
                    className="px-6 py-2 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-100 transition-all active:scale-90"
                  >
                    Purge Asset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
