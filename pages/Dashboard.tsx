
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceData, AuthUser } from '../types';

interface DashboardProps {
  invoices: InvoiceData[];
  onDelete?: (id: string) => void;
  customersCount?: number;
  globalSearchQuery?: string;
  user?: AuthUser | null;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onDelete, customersCount = 0, globalSearchQuery = '', user }) => {
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const totalRevenue = invoices.reduce((acc, inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (inv.taxRate / 100);
    return acc + subtotal + tax;
  }, 0);

  const filteredInvoices = useMemo(() => {
    if (!globalSearchQuery) return invoices;
    const q = globalSearchQuery.toLowerCase().trim();
    return invoices.filter(inv => 
      inv.customer.name.toLowerCase().includes(q) || 
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.notes?.toLowerCase().includes(q)
    );
  }, [invoices, globalSearchQuery]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDelete && isAdmin) onDelete(id);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isAdmin) navigate(`/edit/${id}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[900px] mx-auto">
      
      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            label: 'Revenue', 
            value: `৳${totalRevenue.toLocaleString()}`, 
            dot: 'bg-blue-500', 
            bgColor: 'bg-[#E3F2FD] dark:bg-[#1E293B]' 
          },
          { 
            label: 'Records', 
            value: invoices.length, 
            dot: 'bg-green-500', 
            bgColor: 'bg-[#E8F5E9] dark:bg-[#1B2C1E]' 
          },
          { 
            label: 'Clients', 
            value: customersCount, 
            dot: 'bg-purple-500', 
            bgColor: 'bg-[#FFEBEE] dark:bg-[#2C1B1B]' 
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`clay-card p-10 group hover:-translate-y-1 transition-all ${stat.bgColor}`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`status-dot ${stat.dot}`}></div>
              <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <h2 className="text-xl font-black text-[#1A1A1A] dark:text-white tracking-tight">
             {globalSearchQuery ? `Search Results: "${globalSearchQuery}"` : 'Recent Index'}
           </h2>
           <button 
             onClick={() => navigate('/create')}
             className="tactile-btn bg-black text-white px-6 py-2.5"
           >
             + Add Invoice
           </button>
        </div>

        <div className="clay-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredInvoices.length === 0 ? (
              <div className="p-24 text-center">
                <p className="text-gray-400 font-bold text-sm italic uppercase tracking-widest opacity-40">No Matches Found</p>
              </div>
            ) : (
              filteredInvoices.map((inv, idx) => (
                <div 
                  key={inv.id} 
                  onClick={() => navigate(`/preview/${inv.id}`)}
                  className="px-10 py-8 flex items-center justify-between bg-[#FCE4EC] dark:bg-[#2D1B22] hover:opacity-90 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-full tactile-btn !p-0 shadow-sm border-none bg-[#F8F9FA] dark:bg-[#1A1C1E]">
                      <span className="font-black text-lg text-gray-400">{inv.customer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-black text-lg text-[#1A1A1A] dark:text-gray-200">{inv.customer.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{inv.invoiceNumber} • {inv.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4 md:space-x-8">
                    <div className="hidden sm:block mr-4">
                       <p className="font-black text-lg text-[#1A1A1A] dark:text-gray-200">৳{inv.items.reduce((a,b)=>a+(b.price*b.quantity),0).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`tactile-btn !px-4 !py-2 !text-[9px] uppercase tracking-widest ${inv.status === 'Paid' ? 'text-green-600' : 'text-orange-600'}`}>
                        {inv.status}
                      </div>
                      
                      {/* Action Buttons - Only for Admin */}
                      {isAdmin && (
                        <>
                          <button 
                            onClick={(e) => handleEdit(e, inv.id)}
                            className="tactile-btn !p-2 text-blue-500 hover:scale-110 transition-transform"
                            title="Edit Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          
                          <button 
                            onClick={(e) => handleDelete(e, inv.id)}
                            className="tactile-btn !p-2 text-red-500 hover:scale-110 transition-transform"
                            title="Delete Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
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

export default Dashboard;
