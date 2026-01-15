
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceData } from '../types';

interface DashboardProps {
  invoices: InvoiceData[];
  onDelete?: (id: string) => void;
  customersCount?: number;
}

type FilterType = 'all' | '1h' | '24h' | '7d' | '15d' | '30d' | '6m' | '1y';

const Dashboard: React.FC<DashboardProps> = ({ invoices, onDelete, customersCount = 0 }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getCurrencySymbol = (currency: string) => {
    return currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency;
  };

  const activeCurrency = invoices.length > 0 ? invoices[0].currency : 'BDT';
  const displaySymbol = getCurrencySymbol(activeCurrency);

  const totalRevenue = invoices.reduce((acc, inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * (inv.taxRate / 100);
    const total = subtotal + tax;
    return acc + total;
  }, 0);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/edit/${id}`);
  };

  const filteredInvoices = useMemo(() => {
    let result = invoices;
    if (activeFilter !== 'all') {
      const now = new Date();
      result = result.filter(inv => {
        const invDate = new Date(inv.date);
        const diffMs = now.getTime() - invDate.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffHours / 24;
        switch (activeFilter) {
          case '1h': return diffHours <= 1;
          case '24h': return diffHours <= 24;
          case '7d': return diffDays <= 7;
          case '15d': return diffDays <= 15;
          case '30d': return diffDays <= 30;
          case '6m': return diffDays <= 180;
          case '1y': return diffDays <= 365;
          default: return true;
        }
      });
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(inv => {
        const nameMatch = inv.customer.name.toLowerCase().includes(q);
        const phoneMatch = inv.customer.email?.toLowerCase().includes(q);
        const numberMatch = inv.invoiceNumber.toLowerCase().includes(q);
        const dateMatch = inv.date.toLowerCase().includes(q);
        return nameMatch || phoneMatch || numberMatch || dateMatch;
      });
    }
    return result;
  }, [invoices, activeFilter, searchQuery]);

  const filterOptions: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: '1H', value: '1h' },
    { label: '24H', value: '24h' },
    { label: '7D', value: '7d' },
    { label: '15D', value: '15d' },
    { label: '30D', value: '30d' },
    { label: '6M', value: '6m' },
    { label: '1Y', value: '1y' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-black tracking-tighter text-[#1F2937] leading-none mb-3">
            WARRICK<span className="text-black">.</span>
          </h1>
          <div className="relative inline-block group">
             <div className="absolute -top-2 left-0 w-6 h-[1.5px] bg-gradient-to-r from-black to-transparent rounded-full mb-1"></div>
             <div className="bg-white/60 ios-blur px-3 py-1 rounded-full ios-shadow border border-white/40 mt-0.5">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">
                  POWERED BY ARVIN
                </p>
             </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/create')}
          className="neu-button px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest text-gray-700 hover:text-black"
        >
          Create New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-flat-blue p-6 rounded-ios-lg group transition-all flex flex-col justify-center min-h-[160px] border border-blue-200/50">
          <div className="neu-circle-blue mb-4 w-16 h-16 shadow-sm">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-widest mb-0.5">Lifetime Revenue</p>
          <h3 className="text-2xl font-black text-blue-900">{displaySymbol} {totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="neu-flat-green p-6 rounded-ios-lg flex flex-col justify-center min-h-[160px] border border-green-200/50">
          <div className="neu-circle-green mb-4 w-16 h-16 shadow-sm">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <p className="text-[9px] font-black text-green-600/70 uppercase tracking-widest mb-0.5">Total Invoices</p>
          <h3 className="text-2xl font-black text-green-800">{invoices.length} SELL</h3>
        </div>

        <div className="neu-flat-red p-6 rounded-ios-lg flex flex-col justify-center min-h-[160px] border border-red-200/50">
          <div className="neu-circle-red mb-4 w-16 h-16 shadow-sm">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p className="text-[9px] font-black text-red-600/70 uppercase tracking-widest mb-0.5">Active Accounts</p>
          <h3 className="text-2xl font-black text-red-800">{customersCount} PROFIELS</h3>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative w-full flex justify-center py-2">
          <div className="w-full max-w-4xl bg-ios-bg border border-white/40 p-1.5 rounded-full shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center group">
            <div className="flex-1 bg-ios-bg rounded-full px-6 py-3 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition-all focus-within:shadow-[inset_4px_4px_8px_#a8a9ae,inset_-4px_-4px_8px_#ffffff]">
              <input
                type="text"
                placeholder="SEARCH BY NAME, NUMBER, DATE OR INVOICE #"
                className="w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-gray-800 placeholder:text-ios-gray/40 text-[11px] tracking-wider uppercase h-full"
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
          <div className="px-10 py-6 border-b border-gray-300/30 flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-lg font-black tracking-tight uppercase tracking-[0.1em]">INVOICE LIST</h2>
            
            <div className="flex bg-ios-bg/50 p-1 rounded-full ios-shadow border border-white/20 overflow-x-auto no-scrollbar max-w-full">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black transition-all whitespace-nowrap ${
                    activeFilter === opt.value 
                    ? 'bg-black text-white shadow-md' 
                    : 'text-ios-gray hover:text-black'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-300/20">
            {filteredInvoices.length === 0 ? (
              <div className="p-16 text-center bg-white">
                <p className="text-gray-400 font-black italic text-sm uppercase tracking-widest">
                  {searchQuery 
                    ? `NO INVOICES MATCHING "${searchQuery.toUpperCase()}"` 
                    : (activeFilter === 'all' ? 'No data records found.' : `No invoices found for ${activeFilter.toUpperCase()}`)}
                </p>
              </div>
            ) : (
              filteredInvoices.map((inv) => {
                const subtotal = inv.items.reduce((a, b) => a + (b.price * b.quantity), 0);
                const tax = subtotal * (inv.taxRate / 100);
                const total = subtotal + tax;
                
                return (
                  <div 
                    key={inv.id} 
                    onClick={() => navigate(`/preview/${inv.id}`)}
                    className="px-10 py-5 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="neu-circle w-10 h-10">
                         <span className="font-black text-xs text-gray-600">#</span>
                      </div>
                      <div>
                        <p className="font-black text-gray-800 text-sm">{inv.customer.name}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                          {inv.invoiceNumber} • {inv.date} • {inv.customer.email || 'NO PHONE'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="font-black text-gray-800 text-sm">{getCurrencySymbol(inv.currency)} {total.toLocaleString()}</p>
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${inv.status === 'Paid' ? 'text-green-500' : inv.status === 'Sent' ? 'text-blue-500' : 'text-gray-400'}`}>
                          {inv.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={(e) => handleEdit(e, inv.id)}
                          className="p-2.5 rounded-full bg-blue-50 text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                          title="Edit Invoice"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {onDelete && (
                          <button 
                            onClick={(e) => handleDelete(e, inv.id)}
                            className="p-2.5 rounded-full bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            title="Delete Invoice"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
