
import React, { useMemo } from 'react';
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
    <div className="space-y-12 animate-desktop max-w-[1200px] mx-auto">
      
      {/* Expanded Stats Grid for Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { 
            label: 'Total Revenue', 
            value: `৳${totalRevenue.toLocaleString()}`, 
            dot: 'bg-indigo-500', 
            bgColor: 'bg-[#E0E7FF] dark:bg-[#1E1B4B]' 
          },
          { 
            label: 'Invoices Issued', 
            value: invoices.length, 
            dot: 'bg-emerald-500', 
            bgColor: 'bg-[#ECFDF5] dark:bg-[#064E3B]' 
          },
          { 
            label: 'Registered Clients', 
            value: customersCount, 
            dot: 'bg-violet-500', 
            bgColor: 'bg-[#F5F3FF] dark:bg-[#2E1065]' 
          },
          { 
            label: 'System Status', 
            value: 'ONLINE', 
            dot: 'bg-green-400', 
            bgColor: 'bg-[#F0FDF4] dark:bg-[#14532D]' 
          }
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`clay-card p-8 group hover:-translate-y-2 transition-all cursor-default ${stat.bgColor}`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`status-dot ${stat.dot} animate-pulse`}></div>
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <div>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
               {globalSearchQuery ? `Results for: ${globalSearchQuery}` : 'Transaction Ledger'}
             </h2>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
               {filteredInvoices.length} entries located in database
             </p>
           </div>
           <button 
             onClick={() => navigate('/create')}
             className="tactile-btn bg-black text-white px-8 py-4 shadow-xl active:scale-95 transition-all"
           >
             <span className="mr-2 text-lg">+</span> Create New Invoice
           </button>
        </div>

        <div className="clay-card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredInvoices.length === 0 ? (
              <div className="p-32 text-center">
                <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-white/5 mb-4">
                   <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <p className="text-gray-400 font-bold text-sm italic uppercase tracking-[0.3em] opacity-40">Database Empty or No Match</p>
              </div>
            ) : (
              filteredInvoices.map((inv, idx) => (
                <div 
                  key={inv.id} 
                  onClick={() => navigate(`/preview/${inv.id}`)}
                  className="px-10 py-7 flex items-center justify-between bg-white dark:bg-[#1A1C1E] hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-8">
                    <div className="w-16 h-16 rounded-3xl tactile-btn !p-0 shadow-sm border-none bg-gray-50 dark:bg-[#242629] group-hover:rotate-3 transition-transform">
                      <span className="font-black text-2xl text-indigo-500/40">{inv.customer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-black text-xl text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">{inv.customer.name}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-[10px] bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full font-bold text-gray-500 uppercase tracking-tighter">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{inv.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-12">
                    <div className="text-right">
                       <p className="font-black text-xl text-gray-900 dark:text-gray-100">৳{inv.items.reduce((a,b)=>a+(b.price*b.quantity),0).toLocaleString()}</p>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gross Total</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className={`tactile-btn !px-5 !py-2.5 !text-[10px] font-black uppercase tracking-widest border-none ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {inv.status}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleEdit(e, inv.id)}
                            className="tactile-btn !p-3 text-indigo-500 hover:scale-110"
                            title="Edit Record (Alt+E)"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          
                          <button 
                            onClick={(e) => handleDelete(e, inv.id)}
                            className="tactile-btn !p-3 text-rose-500 hover:scale-110"
                            title="Purge Record"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
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
