
import React, { useState, useMemo, useRef } from 'react';
import { Customer, AuthUser } from '../types';

interface CustomersProps {
  customers: Customer[];
  onAdd: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onDelete: (id: string) => void;
  globalSearchQuery?: string;
  user?: AuthUser | null;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAdd, onUpdate, onDelete, globalSearchQuery = '', user }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const isAdmin = user?.role === 'Admin';

  const filteredCustomers = useMemo(() => {
    if (!globalSearchQuery) return customers;
    const q = globalSearchQuery.toLowerCase().trim();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    );
  }, [customers, globalSearchQuery]);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

    const phoneNormalized = newCustomer.phone.replace(/\s/g, '');
    const duplicate = customers.find(c => 
      c.phone.replace(/\s/g, '') === phoneNormalized && c.id !== editingId
    );

    if (duplicate) {
      alert("Already Have Account");
      return;
    }

    if (editingId) {
      if (!isAdmin) return;
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
    if (!isAdmin) return;
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

  const exportSingleCustomer = (customer: Customer) => {
    if (!isAdmin) return;
    
    const element = document.createElement('div');
    element.style.padding = '60px';
    element.style.fontFamily = 'Inter, sans-serif';
    element.innerHTML = `
      <div style="border: 2px solid #000; padding: 40px; background: #fff;">
        <div style="margin-bottom: 40px; text-align: center;">
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">WARRICK CLIENT PROFILE</h1>
          <p style="font-size: 10px; color: #666; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; margin-top: 5px;">Secure Data Export</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <label style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase;">Full Name</label>
          <div style="font-size: 22px; font-weight: 900; color: #000; margin-top: 5px; border-bottom: 1px solid #eee; padding-bottom: 10px;">${customer.name}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <label style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase;">Contact Number</label>
          <div style="font-size: 18px; font-weight: 700; color: #333; margin-top: 5px; border-bottom: 1px solid #eee; padding-bottom: 10px;">${customer.phone}</div>
        </div>

        <div style="margin-bottom: 40px;">
          <label style="font-size: 10px; font-weight: 900; color: #999; text-transform: uppercase;">Registered Location</label>
          <div style="font-size: 16px; font-weight: 600; color: #444; margin-top: 5px; line-height: 1.5;">${customer.address || 'Not Provided'}</div>
        </div>

        <div style="border-top: 1px dashed #ccc; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <p style="font-size: 8px; font-weight: 900; color: #aaa; text-transform: uppercase;">Record ID</p>
            <p style="font-size: 9px; font-weight: 700; color: #000;">${customer.id}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 8px; font-weight: 900; color: #aaa; text-transform: uppercase;">Export Date</p>
            <p style="font-size: 9px; font-weight: 700; color: #000;">${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div style="margin-top: 60px; text-align: center; border-top: 2px solid #000; padding-top: 20px;">
          <p style="font-size: 9px; font-weight: 900; color: #000; letter-spacing: 2px;">WARRICK INTELLIGENCE SYSTEM</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Profile_${customer.name.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().from(element).set(opt).save();
  };

  const handleExportAll = () => {
    if (!isAdmin) return;
    if (customers.length === 0) return alert("No records to export.");

    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Inter, sans-serif';
    element.innerHTML = `
      <div style="margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h1 style="font-size: 24px; font-weight: 900; margin: 0;">WARRICK CUSTOMER INDEX</h1>
        <p style="font-size: 10px; color: #666; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Database Export • ${new Date().toLocaleDateString()}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f4f4f4;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">NAME</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">PHONE</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">ADDRESS</th>
          </tr>
        </thead>
        <tbody>
          ${customers.map(c => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; font-weight: 700;">${c.name}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${c.phone}</td>
              <td style="border: 1px solid #ddd; padding: 10px;">${c.address || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="margin-top: 30px; text-align: center; color: #999; font-size: 9px; font-weight: 800;">
        GENERATED BY WARRICK INTELLIGENCE SYSTEM
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Warrick_Customers_All_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="w-full space-y-12 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-black tracking-tighter text-[#1F2937] dark:text-white leading-none mb-4">
            WARRICK<span className="text-black dark:text-blue-500">.</span>
          </h1>
          <div className="relative inline-block group">
             <div className="bg-white/60 dark:bg-white/5 px-4 py-1.5 rounded-full border border-white/40 mt-1 shadow-sm">
                <p className="text-[10px] font-black text-[#4B5563] dark:text-gray-400 uppercase tracking-[0.2em]">
                  POWERED BY ARVIN
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button 
              onClick={handleExportAll}
              className="tactile-btn px-8 py-4 bg-white text-blue-600 border-none"
            >
              Export All
            </button>
          )}
          <button 
            onClick={() => {
              if (isAdding) resetForm();
              else setIsAdding(true);
            }}
            className={`tactile-btn px-10 py-4 ${
              isAdding ? 'bg-gray-100 text-gray-400' : ''
            }`}
          >
            {isAdding ? 'Dismiss' : 'New Profile'}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="flex justify-center w-full animate-in fade-in zoom-in-95 duration-500">
          <form 
            onSubmit={handleAction} 
            className="clay-card p-8 md:p-12 w-full max-w-3xl"
          >
            <div className="flex items-center space-x-4 mb-10">
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 ml-4 uppercase tracking-widest">FULL NAME</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    required
                    type="text"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 ml-4 uppercase tracking-widest">CONTACT</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    required
                    type="tel"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 ml-4 uppercase tracking-widest">LOCATION</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    placeholder="Enter city or full address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end space-x-4">
              <button 
                type="submit" 
                className="tactile-btn bg-black text-white px-10 py-4"
              >
                {editingId ? 'Update Profile' : 'Commit Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-6">
        <div className="clay-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {!isAdmin ? (
              <div className="p-24 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full tactile-btn !p-0 bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-13a4 4 0 014 4v2m0 0a4 4 0 01-4 4H8a4 4 0 01-4-4V9a4 4 0 014-4h.172a4 4 0 012.828 1.172L12 7.172z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-black italic tracking-widest text-xs uppercase opacity-40">
                    ACCESS RESTRICTED • ADMIN ONLY DATA
                  </p>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-24 text-center">
                <p className="text-gray-400 font-black italic tracking-widest text-xs uppercase opacity-40">
                  {globalSearchQuery ? `NO MATCHES FOR "${globalSearchQuery}"` : 'NO RECORDS FOUND'}
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-10 flex items-center justify-between bg-[#E8F5E9] dark:bg-[#1B2C1E] hover:opacity-90 transition-all cursor-pointer group">
                  <div className="flex items-center space-x-8">
                    <div className="w-16 h-16 rounded-full tactile-btn !p-0 bg-[#F8F9FA] dark:bg-[#1A1C1E]">
                      <span className="font-black text-2xl text-gray-400">{customer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl text-gray-800 dark:text-gray-200 tracking-tight">{customer.name}</h4>
                      <div className="flex items-center space-x-4">
                        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">{customer.phone}</p>
                        {customer.address && (
                          <>
                            <span className="text-gray-300 text-[10px]">•</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate max-w-[200px]">{customer.address}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {isAdmin && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); exportSingleCustomer(customer); }} 
                          className="tactile-btn !p-3 text-green-600"
                          title="Export Profile"
                        >
                          Export
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(customer); }} className="tactile-btn !p-3 text-blue-500">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(customer.id); }} className="tactile-btn !p-3 text-red-500">Delete</button>
                      </>
                    )}
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
