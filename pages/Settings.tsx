
import React, { useState } from 'react';
import { BusinessInfo, AuthUser } from '../types';

interface SettingsProps {
  business: BusinessInfo;
  onUpdate: (info: BusinessInfo) => void;
  onLogout: () => void;
  user: AuthUser;
  onRegisterUser: (newUser: AuthUser) => void;
  users: AuthUser[];
  darkMode: boolean;
  onToggleDark: () => void;
  onUpdateUser?: (updatedUser: AuthUser) => void;
  onDeleteUser?: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  business, 
  onUpdate, 
  onLogout, 
  user, 
  onRegisterUser,
  users,
  darkMode, 
  onToggleDark,
  onUpdateUser,
  onDeleteUser
}) => {
  const [formData, setFormData] = useState<BusinessInfo>(business);
  const [saved, setSaved] = useState(false);
  
  // New Staff State
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', password: '' });

  const isAdmin = user.role === 'Admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.username || !newStaff.password) return;
    
    if (editingStaffId && onUpdateUser) {
      const updatedStaff: AuthUser = {
        id: editingStaffId,
        role: 'Staff',
        name: newStaff.name,
        username: newStaff.username,
        password: newStaff.password
      };
      // We leverage the App's setUsers by mapping if onUpdateUser isn't explicitly passed, 
      // but assuming we should follow the pattern used for other lists.
      // Since App.tsx has a 'setUsers' inside 'onRegisterUser' type flow, 
      // let's ensure the parent logic handles updates if provided.
      if (onUpdateUser) {
        onUpdateUser(updatedStaff);
      } else {
        // Fallback: If onUpdateUser isn't passed, we use the register function but logic depends on App.tsx
        // For this specific app structure, we'll assume onUpdateUser handles the array logic.
        onRegisterUser(updatedStaff); 
      }
    } else {
      const staffUser: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'Staff',
        name: newStaff.name,
        username: newStaff.username,
        password: newStaff.password
      };
      onRegisterUser(staffUser);
    }
    
    resetStaffForm();
  };

  const resetStaffForm = () => {
    setNewStaff({ name: '', username: '', password: '' });
    setShowStaffForm(false);
    setEditingStaffId(null);
  };

  const handleEditStaff = (staff: AuthUser) => {
    setNewStaff({ 
      name: staff.name, 
      username: staff.username, 
      password: (staff as any).password || '' 
    });
    setEditingStaffId(staff.id);
    setShowStaffForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-[32px] font-black tracking-tighter text-[#1A1A1A] dark:text-white leading-none">
          WARRICK<span className="text-blue-500">.</span>
        </h1>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Preferences</p>
      </div>

      <div className="space-y-8">
        
        {/* Profile Card */}
        <div className="clay-card p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full tactile-btn !p-0 bg-blue-500/10 border-none shadow-sm flex items-center justify-center">
              <span className="text-3xl font-black text-blue-500">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white tracking-tight">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="status-dot bg-green-500 w-2 h-2"></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{user.role} Account Active</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="tactile-btn px-10 py-4 text-red-500 text-[11px] uppercase tracking-widest border-none"
          >
            Sign Out
          </button>
        </div>

        {/* Global Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="clay-card p-8 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Interface Theme</p>
              <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">{darkMode ? 'Lunar Protocol' : 'Solar Protocol'}</p>
            </div>
            <div 
              className={`mech-toggle ${darkMode ? 'active' : ''}`}
              onClick={onToggleDark}
            >
              <div className="mech-knob"></div>
            </div>
          </div>

          <div className="clay-card p-8 flex items-center justify-between opacity-50 grayscale pointer-events-none">
            <div className="space-y-1">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Auto-Backup</p>
              <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">Cloud Sync Enabled</p>
            </div>
            <div className="mech-toggle active">
              <div className="mech-knob translate-x-6"></div>
            </div>
          </div>
        </div>

        {/* Staff Management - ONLY ADMIN CAN SEE */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Authorized Staff</h3>
              <button 
                onClick={() => {
                  if (showStaffForm) resetStaffForm();
                  else setShowStaffForm(true);
                }}
                className="tactile-btn !py-2 !px-6 text-[10px] uppercase tracking-widest"
              >
                {showStaffForm ? 'Cancel' : '+ Create Account'}
              </button>
            </div>

            {showStaffForm && (
              <form onSubmit={handleCreateStaff} className="clay-card p-10 space-y-6 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">Name</label>
                    <div className="sunken-well px-6 h-[54px] flex items-center">
                      <input
                        type="text"
                        required
                        className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">Gmail/Number</label>
                    <div className="sunken-well px-6 h-[54px] flex items-center">
                      <input
                        type="text"
                        required
                        className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                        value={newStaff.username}
                        onChange={(e) => setNewStaff({...newStaff, username: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">Password</label>
                    <div className="sunken-well px-6 h-[54px] flex items-center">
                      <input
                        type="password"
                        required
                        className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                        value={newStaff.password}
                        onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="tactile-btn bg-black text-white px-10 py-3 text-[11px] uppercase tracking-widest">
                    {editingStaffId ? 'Update Staff Account' : 'Save Staff Account'}
                  </button>
                </div>
              </form>
            )}

            <div className="clay-card overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.filter(u => u.role === 'Staff').length === 0 ? (
                  <div className="p-12 text-center text-gray-400 text-[10px] font-black uppercase tracking-widest opacity-40">
                    No Staff Accounts Created
                  </div>
                ) : (
                  users.filter(u => u.role === 'Staff').map((staff) => (
                    <div key={staff.id} className="p-8 flex items-center justify-between bg-[#E8F5E9] dark:bg-[#1B2C1E] hover:opacity-90 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full tactile-btn !p-0 bg-gray-100 dark:bg-[#1A1C1E]">
                          <span className="font-black text-gray-400 uppercase">{staff.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1A1A1A] dark:text-white">{staff.name}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: {staff.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditStaff(staff)}
                          className="tactile-btn !p-2 text-blue-500 hover:scale-110 transition-transform"
                          title="Edit Staff"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {onDeleteUser && (
                          <button 
                            onClick={() => onDeleteUser(staff.id)}
                            className="tactile-btn !p-2 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Staff"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Business Settings Form */}
        {isAdmin && (
          <form onSubmit={handleSubmit} className="clay-card p-10 md:p-14 space-y-12">
            <div className="flex items-center space-x-4">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Business Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Trading Identity</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Contact Email</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="email"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Primary Line</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Office Address</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
              <p className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-500 ${saved ? 'text-green-500' : 'opacity-0'}`}>
                Configuration Saved Successfully
              </p>
              <button 
                type="submit" 
                className="tactile-btn bg-[#1A1A1A] text-white px-12 py-5 shadow-2xl"
              >
                COMMIT CHANGES
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center pt-10">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest opacity-60">
          WARRICK v2.5.0 • SECURED SYSTEM ENVIRONMENT
        </p>
      </div>
    </div>
  );
};

export default Settings;
