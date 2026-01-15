
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  onAdd: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    if (editingId) {
      onUpdate({
        ...newCustomer,
        id: editingId,
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address || '',
        email: newCustomer.email || '',
        createdAt: customers.find(c => c.id === editingId)?.createdAt || new Date().toISOString()
      } as Customer);
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        name: newCustomer.name,
        phone: newCustomer.phone,
        address: newCustomer.address || '',
        email: newCustomer.email || '',
        createdAt: new Date().toISOString()
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setNewCustomer({ name: '', phone: '', address: '', email: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (customer: Customer) => {
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email
    });
    setEditingId(customer.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.replace(/\s/g, '');
    return customers.filter(c => 
      c.phone.replace(/\s/g, '').includes(query) || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <div className="w-full space-y-12 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-black tracking-tighter text-[#1F2937] leading-none mb-4">
            WARRICK<span className="text-black">.</span>
          </h1>
          <div className="relative inline-block group">
             <div className="absolute -top-3 left-0 w-8 h-[2px] bg-gradient-to-r from-black to-transparent rounded-full mb-2"></div>
             <div className="bg-white/60 ios-blur px-4 py-1.5 rounded-full ios-shadow border border-white/40 mt-1">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">
                  POWERED BY ARVIN
                </p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          className={`neu-button px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center space-x-3 transition-all ${
            isAdding ? 'neu-pressed text-gray-400' : 'text-gray-700'
          }`}
        >
          {isAdding ? 'Dismiss' : 'New Profile'}
        </button>
      </div>

      {isAdding && (
        <div className="flex justify-center w-full animate-in fade-in zoom-in-95 duration-500">
          <form 
            onSubmit={handleAction} 
            className="bg-white p-8 md:p-12 rounded-ios-lg ios-shadow border border-white/20 w-full max-w-3xl"
          >
            <div className="flex items-center space-x-4 mb-10">
              <div className="w-1.5 h-8 bg-black rounded-full"></div>
              <h3 className="text-xl font-black tracking-tight text-gray-800 uppercase text-[14px]">
                {editingId ? 'Edit Profile' : 'Profile Registration'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">FULL NAME</label>
                <input
                  required
                  type="text"
                  placeholder=""
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-4 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-gray-800 placeholder:text-gray-400/30 text-sm"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">CONTACT</label>
                <input
                  required
                  type="tel"
                  placeholder="+880"
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-4 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-gray-800 placeholder:text-gray-400/30 text-sm"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest block mb-1">ADDRESS</label>
                <textarea
                  placeholder=""
                  className="w-full bg-ios-bg/50 border-none rounded-full px-8 py-4 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-medium text-gray-800 min-h-[56px] h-[56px] resize-none placeholder:text-gray-400/30 text-sm leading-normal flex items-center"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-10 flex justify-end space-x-4">
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 bg-ios-bg text-gray-500 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-all active:scale-95"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className="px-10 py-4 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 ios-shadow"
              >
                {editingId ? 'Update Profile' : 'Commit Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div className="relative w-full flex justify-center py-2">
          <div className="w-full bg-ios-bg border border-white/40 p-1.5 rounded-full shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center group">
            <div className="flex-1 bg-ios-bg rounded-full px-6 py-3 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition-all focus-within:shadow-[inset_4px_4px_8px_#a8a9ae,inset_-4px_-4px_8px_#ffffff]">
              <input
                type="text"
                placeholder="SEARCH BY PHONE OR NAME..."
                className="w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-gray-900 placeholder:text-ios-gray/40 text-[11px] tracking-wider uppercase h-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-ios-gray/60 group-focus-within:text-black transition-all bg-white rounded-full ml-1.5 shadow-sm border border-white/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-ios-lg overflow-hidden ios-shadow border border-white/40">
          <div className="divide-y divide-gray-300/20">
            {filteredCustomers.length === 0 ? (
              <div className="p-24 text-center bg-white">
                <div className="neu-circle w-20 h-20 mx-auto mb-6 opacity-40 grayscale">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                  </svg>
                </div>
                <p className="text-gray-400 font-black italic tracking-widest text-xs uppercase">
                  {searchQuery ? `NO MATCHING PROFILE FOR "${searchQuery}"` : 'NO RECORDS REGISTERED'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setNewCustomer({...newCustomer, phone: searchQuery});
                      setIsAdding(true);
                    }}
                    className="mt-6 text-black font-black text-[10px] uppercase tracking-widest border-b-2 border-black/10 hover:border-black transition-all pb-1"
                  >
                    Create Profile with this number?
                  </button>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-10 flex items-center justify-between hover:bg-white/10 transition-all group animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center space-x-8">
                    <div className="neu-circle w-16 h-16 bg-white/40 shadow-sm border border-white/20">
                      <span className="font-black text-2xl text-gray-500">{customer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-gray-800 tracking-tight">{customer.name}</h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden lg:block mr-6">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">Registered Coordinates</p>
                      <p className="text-sm text-gray-600 font-bold max-w-[200px] line-clamp-1">{customer.address || 'NO ADDRESS SPECIFIED'}</p>
                    </div>
                    <div className="flex items-center space-x-2 transition-opacity">
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="p-3 rounded-full bg-blue-50 text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all flex items-center justify-center shadow-sm"
                        title="Edit Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onDelete(customer.id)}
                        className="p-3 rounded-full bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all flex items-center justify-center shadow-sm"
                        title="Delete Profile"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
