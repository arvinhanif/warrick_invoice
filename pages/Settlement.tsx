
import React, { useState, useMemo } from 'react';
import { InvoiceData, AuthUser, Product } from '../types';

interface SettlementProps {
  invoices: InvoiceData[];
  products: Product[];
  user: AuthUser | null;
}

type TimeRange = '1h' | '24h' | '7D' | '15D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'Lifetime' | 'Custom';

const Settlement: React.FC<SettlementProps> = ({ invoices, products, user }) => {
  const isAdmin = user?.role === 'Admin';
  const [selectedRange, setSelectedRange] = useState<TimeRange>('Lifetime');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  const filterButtons: TimeRange[] = ['1h', '24h', '7D', '15D', '1M', '3M', '6M', '1Y', '5Y', 'Lifetime', 'Custom'];

  const filteredInvoices = useMemo(() => {
    if (selectedRange === 'Lifetime') return invoices;

    const now = new Date();
    let startDate = new Date();

    switch (selectedRange) {
      case '1h': startDate.setHours(now.getHours() - 1); break;
      case '24h': startDate.setHours(now.getHours() - 24); break;
      case '7D': startDate.setDate(now.getDate() - 7); break;
      case '15D': startDate.setDate(now.getDate() - 15); break;
      case '1M': startDate.setMonth(now.getMonth() - 1); break;
      case '3M': startDate.setMonth(now.getMonth() - 3); break;
      case '6M': startDate.setMonth(now.getMonth() - 6); break;
      case '1Y': startDate.setFullYear(now.getFullYear() - 1); break;
      case '5Y': startDate.setFullYear(now.getFullYear() - 5); break;
      case 'Custom':
        if (!customDates.start) return invoices;
        const start = new Date(customDates.start);
        const end = customDates.end ? new Date(customDates.end) : new Date();
        return invoices.filter(inv => {
          const invDate = new Date(inv.date);
          return invDate >= start && invDate <= end;
        });
      default: return invoices;
    }

    return invoices.filter(inv => new Date(inv.date) >= startDate);
  }, [invoices, selectedRange, customDates]);

  const stats = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'Paid');
    const pendingInvoices = filteredInvoices.filter(inv => inv.status !== 'Paid');

    const calculateTotal = (list: InvoiceData[]) => list.reduce((acc, inv) => {
      const subtotal = inv.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * (inv.taxRate / 100);
      return acc + subtotal + tax;
    }, 0);

    const totalUnitsSold = filteredInvoices.reduce((acc, inv) => {
      return acc + inv.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);

    const productPerformance = products.map(p => {
      const soldInPeriod = filteredInvoices.reduce((acc, inv) => {
        const itemMatch = inv.items.find(item => item.name.toLowerCase() === p.name.toLowerCase());
        return acc + (itemMatch ? itemMatch.quantity : 0);
      }, 0);
      return { ...p, soldInPeriod };
    });

    return {
      received: calculateTotal(paidInvoices),
      pending: calculateTotal(pendingInvoices),
      total: calculateTotal(filteredInvoices),
      unitsSold: totalUnitsSold,
      productPerformance
    };
  }, [filteredInvoices, products]);

  const handleAllExport = () => {
    if (!isAdmin) return;
    
    const element = document.createElement('div');
    element.style.padding = '40px';
    element.style.fontFamily = 'Inter, sans-serif';
    element.innerHTML = `
      <div style="border: 2px solid #000; padding: 40px; background: #fff;">
        <div style="margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
          <h1 style="font-size: 24px; font-weight: 900; margin: 0;">SETTLEMENT RECONCILIATION REPORT</h1>
          <p style="font-size: 10px; color: #666; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">
            Filter: ${selectedRange} ${selectedRange === 'Custom' ? `(${customDates.start} to ${customDates.end || 'Today'})` : ''}
          </p>
          <p style="font-size: 8px; color: #aaa; margin-top: 5px;">GENERATE DATE: ${new Date().toLocaleString()}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <p style="font-size: 8px; font-weight: 900; color: #999; text-transform: uppercase;">Total Received</p>
            <p style="font-size: 18px; font-weight: 900; color: #16a34a;">৳ ${stats.received.toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <p style="font-size: 8px; font-weight: 900; color: #999; text-transform: uppercase;">Pending Balance</p>
            <p style="font-size: 18px; font-weight: 900; color: #ea580c;">৳ ${stats.pending.toLocaleString()}</p>
          </div>
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <p style="font-size: 8px; font-weight: 900; color: #999; text-transform: uppercase;">Gross Billing</p>
            <p style="font-size: 18px; font-weight: 900; color: #2563eb;">৳ ${stats.total.toLocaleString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
           <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; margin-bottom: 15px;">Product Sales & Inventory Breakdown</h3>
           <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
             <thead>
               <tr style="background: #f8f9fa;">
                 <th style="border: 1px solid #eee; padding: 10px; text-align: left;">PRODUCT NAME</th>
                 <th style="border: 1px solid #eee; padding: 10px; text-align: center;">UNITS SOLD</th>
                 <th style="border: 1px solid #eee; padding: 10px; text-align: center;">CURRENT STOCK</th>
                 <th style="border: 1px solid #eee; padding: 10px; text-align: right;">UNIT PRICE</th>
               </tr>
             </thead>
             <tbody>
               ${stats.productPerformance.map(p => `
                 <tr>
                   <td style="border: 1px solid #eee; padding: 10px; font-weight: 700;">${p.name.toUpperCase()}</td>
                   <td style="border: 1px solid #eee; padding: 10px; text-align: center;">${p.soldInPeriod}</td>
                   <td style="border: 1px solid #eee; padding: 10px; text-align: center; color: ${p.stock <= 10 ? '#ef4444' : '#000'}; font-weight: ${p.stock <= 10 ? '900' : 'normal'}">${p.stock}</td>
                   <td style="border: 1px solid #eee; padding: 10px; text-align: right;">৳ ${p.price.toLocaleString()}</td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px dashed #ccc; padding-top: 20px;">
          <p style="font-size: 9px; font-weight: 900; color: #000; letter-spacing: 2px;">WARRICK INTELLIGENCE SYSTEM • SECURED DOCUMENT</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `Settlement_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    window.html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="w-full space-y-12 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-black tracking-tighter text-[#1F2937] dark:text-white leading-none mb-4">
            SETTLEMENT<span className="text-black dark:text-blue-500">.</span>
          </h1>
          <div className="bg-white/60 dark:bg-white/5 px-4 py-1.5 rounded-full border border-white/40 mt-1 shadow-sm inline-block">
            <p className="text-[10px] font-black text-[#4B5563] dark:text-gray-400 uppercase tracking-[0.2em]">
              FINANCIAL & STOCK RECONCILIATION
            </p>
          </div>
        </div>
        
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-full">
          Showing: {selectedRange === 'Custom' ? `${customDates.start || '...'} to ${customDates.end || 'Today'}` : selectedRange}
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="clay-card p-4 overflow-x-auto">
        <div className="flex items-center space-x-3 min-w-max px-2">
          {filterButtons.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`tactile-btn !py-2.5 !px-6 text-[10px] uppercase tracking-widest transition-all duration-300 ${
                selectedRange === range 
                ? 'bg-[#1A1A1A] text-white !shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]' 
                : 'hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {range}
            </button>
          ))}
          
          {/* Vertical Separator */}
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>
          
          {/* All Export Button */}
          {isAdmin && (
            <button
              onClick={handleAllExport}
              className="tactile-btn !py-2.5 !px-8 text-[10px] uppercase tracking-widest bg-blue-500 text-white border-none shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              All Export
            </button>
          )}
        </div>
      </div>

      {selectedRange === 'Custom' && (
        <div className="clay-card p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">Start Date</label>
              <div className="sunken-well px-6 h-[50px] flex items-center">
                <input
                  type="date"
                  className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                  value={customDates.start}
                  onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest">End Date</label>
              <div className="sunken-well px-6 h-[50px] flex items-center">
                <input
                  type="date"
                  className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                  value={customDates.end}
                  onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="clay-card p-10 bg-[#E8F5E9] dark:bg-[#1B2C1E] group hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Received</p>
          <h3 className="text-3xl font-black text-green-600 tracking-tight">৳{stats.received.toLocaleString()}</h3>
        </div>
        <div className="clay-card p-10 bg-[#FFF3E0] dark:bg-[#2C241B] group hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pending Balance</p>
          <h3 className="text-3xl font-black text-orange-600 tracking-tight">৳{stats.pending.toLocaleString()}</h3>
        </div>
        <div className="clay-card p-10 bg-[#E3F2FD] dark:bg-[#1E293B] group hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gross Billing</p>
          <h3 className="text-3xl font-black text-blue-600 tracking-tight">৳{stats.total.toLocaleString()}</h3>
        </div>
      </div>

      {/* Stock Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="clay-card p-10 bg-[#F3E5F5] dark:bg-[#2A1B2D] group hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Units Sold (Period)</p>
          <h3 className="text-3xl font-black text-purple-600 tracking-tight">{stats.unitsSold} <span className="text-sm">Units</span></h3>
        </div>
        <div className="clay-card p-10 bg-[#ECEFF1] dark:bg-[#1A1C1E] group hover:scale-[1.02] transition-transform">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Active Stock</p>
          <h3 className="text-3xl font-black text-gray-800 dark:text-gray-200 tracking-tight">{products.reduce((a,b) => a + b.stock, 0)} <span className="text-sm">In Inventory</span></h3>
        </div>
      </div>

      {/* Product Breakdown Section */}
      <div className="clay-card p-10 space-y-8">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Product Sales Breakdown</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Period</span>
        </div>

        <div className="space-y-4">
          {stats.productPerformance.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-40">No Product Data Available</div>
          ) : (
            stats.productPerformance.map((prod) => (
              <div key={prod.id} className="flex justify-between items-center p-6 sunken-well">
                <div className="space-y-1">
                  <span className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tight">{prod.name}</span>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price: ৳{prod.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-10">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sold</p>
                    <span className="text-lg font-black text-purple-600">{prod.soldInPeriod}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock</p>
                    <span className={`text-lg font-black ${prod.stock <= 10 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{prod.stock}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isAdmin && (
          <div className="p-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed breakdown restricted to Admin</p>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="clay-card p-10 space-y-8">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Transaction Summary ({filteredInvoices.length})</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-6 sunken-well">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Selected Period Count</span>
            <span className="text-xl font-black text-gray-800 dark:text-white">{filteredInvoices.length}</span>
          </div>
          <div className="flex justify-between items-center p-6 sunken-well">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Settled Records</span>
            <span className="text-xl font-black text-green-600">{filteredInvoices.filter(i => i.status === 'Paid').length}</span>
          </div>
          <div className="flex justify-between items-center p-6 sunken-well">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Unsettled Records</span>
            <span className="text-xl font-black text-orange-600">{filteredInvoices.filter(i => i.status !== 'Paid').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settlement;
