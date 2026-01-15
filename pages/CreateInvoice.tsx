
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BusinessInfo, InvoiceData, InvoiceItem, Customer, Product } from '../types';

interface CreateInvoiceProps {
  business: BusinessInfo;
  onSave: (invoice: InvoiceData) => void;
  customers?: Customer[]; 
  invoices?: InvoiceData[];
  products?: Product[];
}

const CreateInvoice: React.FC<CreateInvoiceProps> = ({ business, onSave, customers = [], invoices = [], products = [] }) => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [activeSuggestionRow, setActiveSuggestionRow] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const getCurrencySymbol = (currency: string) => {
    return currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency;
  };

  const getNextInvoiceNumber = () => {
    // We look at all invoices across the system to ensure global sequential numbering
    if (!invoices || invoices.length === 0) return "#0001";
    
    // Find the highest number among all invoices to avoid collisions even if some were deleted or created by different users
    const numbers = invoices.map(inv => {
      const match = inv.invoiceNumber.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    const highestNum = Math.max(...numbers);
    return `#${(highestNum + 1).toString().padStart(4, '0')}`;
  };

  const [invoice, setInvoice] = useState<Partial<InvoiceData & { warrantyDate?: string }>>({
    id: Math.random().toString(36).substr(2, 9),
    invoiceNumber: getNextInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    business: business,
    customer: { name: '', email: '', address: '' },
    items: [{ id: '1', name: '', quantity: 1, price: 0 }],
    currency: 'BDT',
    taxRate: 0,
    discount: 0,
    notes: '',
    terms: 'Payment is due within 14 days. Thank you!',
    status: 'Draft',
    warrantyDate: ''
  });

  const isEditMode = !!editId;

  useEffect(() => {
    if (isEditMode && invoices.length > 0) {
      const existing = invoices.find(inv => inv.id === editId);
      if (existing) {
        setInvoice(existing);
      }
    } else {
      // Refresh invoice number on fresh load to ensure it's up to date with latest system state
      setInvoice(prev => ({ ...prev, invoiceNumber: getNextInvoiceNumber() }));
    }
  }, [editId, invoices, isEditMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setActiveSuggestionRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneLookup = (phoneQuery: string) => {
    setInvoice(prev => ({ 
      ...prev, 
      customer: { ...prev.customer!, email: phoneQuery } 
    }));

    if (phoneQuery.length >= 4) {
      const found = customers.find(c => c.phone.replace(/\s/g, '') === phoneQuery.replace(/\s/g, ''));
      if (found) {
        setInvoice(prev => ({
          ...prev,
          customer: {
            name: found.name,
            email: found.phone,
            address: found.address
          }
        }));
      }
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => {
      const newItems = prev.items?.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If name matches exactly a product, auto-fill price
          if (field === 'name') {
            const matchedProduct = products.find(p => p.name.toLowerCase() === value.toLowerCase());
            if (matchedProduct) {
              updated.price = matchedProduct.price;
            }
          }
          return updated;
        }
        return item;
      });
      return { ...prev, items: newItems };
    });
  };

  const selectProduct = (itemId: string, product: Product) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items?.map(item => 
        item.id === itemId 
          ? { ...item, name: product.name, price: product.price } 
          : item
      )
    }));
    setActiveSuggestionRow(null);
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...(prev.items || []), { id: Date.now().toString(), name: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return (invoice.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const total = calculateSubtotal() * (1 + (invoice.taxRate || 0) / 100);

  const handleSave = () => {
    if (!invoice.customer?.name) {
      alert("Please enter customer name");
      return;
    }
    onSave({ ...invoice, discount: 0 } as InvoiceData);
    navigate('/dashboard');
  };

  const statusOptions = [
    { value: 'Draft', label: 'Draft', color: 'bg-gray-400', textColor: 'text-gray-600' },
    { value: 'Sent', label: 'Sent', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { value: 'Paid', label: 'Paid', color: 'bg-green-500', textColor: 'text-green-600' }
  ];

  const currentStatus = statusOptions.find(opt => opt.value === invoice.status) || statusOptions[0];

  return (
    <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-black tracking-tighter text-[#1F2937] leading-none mb-3">
            WARRICK<span className="text-black">.</span>
          </h1>
          <div className="relative inline-block group">
             <div className="absolute -top-2.5 left-0 w-6 h-[2px] bg-gradient-to-r from-black to-transparent rounded-full mb-1"></div>
             <div className="bg-white/60 ios-blur px-3 py-1 rounded-full ios-shadow border border-white/40 mt-0.5">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">
                  POWERED BY ARVIN
                </p>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2 text-ios-gray font-bold hover:text-black transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            className="neu-button px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest text-gray-700 hover:text-black"
          >
            {isEditMode ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </div>

      <div className="bg-white p-7 md:p-10 rounded-ios-lg ios-shadow border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-4 bg-black rounded-full"></div>
              <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-[0.2em]">Customer Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Full Name</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-medium text-black text-sm"
                  value={invoice.customer?.name}
                  onChange={(e) => setInvoice({ ...invoice, customer: { ...invoice.customer!, name: e.target.value } })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Mobile / Customer ID</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder=""
                    className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-black text-sm"
                    value={invoice.customer?.email}
                    onChange={(e) => handlePhoneLookup(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-black opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Address</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-medium text-black text-sm"
                  value={invoice.customer?.address}
                  onChange={(e) => setInvoice({ ...invoice, customer: { ...invoice.customer!, address: e.target.value } })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Warranty</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-black text-sm"
                  value={invoice.warrantyDate || ''}
                  onChange={(e) => setInvoice({ ...invoice, warrantyDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="invisible h-10 mb-[-24px]"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Ref Number</label>
                <input
                  type="text"
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-black text-sm"
                  value={invoice.invoiceNumber}
                  readOnly
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Invoice Date</label>
                <input
                  type="date"
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-black text-sm"
                  value={invoice.date}
                  onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 relative" ref={statusRef}>
                <label className="text-[10px] font-black text-ios-gray ml-2 uppercase tracking-widest mb-1 block">Payment Status</label>
                <button
                  type="button"
                  onClick={() => setIsStatusOpen(!isStatusOpen)}
                  className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 flex items-center justify-between focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-black text-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${currentStatus.color} shadow-sm`}></div>
                    <span>{currentStatus.label}</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isStatusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 ios-blur ios-shadow rounded-2xl border border-white/40 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setInvoice({ ...invoice, status: opt.value as any }); setIsStatusOpen(false); }}
                        className={`w-full px-6 py-3.5 flex items-center justify-between text-left hover:bg-black/5 transition-colors ${invoice.status === opt.value ? 'bg-black/5' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${opt.color}`}></div>
                          <span className="font-bold text-sm text-gray-800">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-ios-lg ios-shadow overflow-hidden border border-white/20">
        <div className="bg-ios-bg/40 px-8 py-5 flex items-center justify-between border-b border-ios-separator/10">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-black rounded-full"></div>
            <h3 className="font-black text-gray-800 uppercase text-[10px] tracking-[0.3em]">SELECT ITEMS</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-ios-gray text-[10px] uppercase font-black tracking-[0.2em] border-b border-ios-separator/10">
                <th className="py-5 pl-10 pr-4">Description</th>
                <th className="py-5 px-4 w-28 text-center">Qty</th>
                <th className="py-5 px-4 w-48 text-center">Price</th>
                <th className="py-5 px-4 w-40 text-right">Total</th>
                <th className="py-5 pr-8 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ios-separator/5">
              {invoice.items?.map((item) => (
                <tr key={item.id} className="group hover:bg-ios-bg/5 transition-colors">
                  <td className="py-6 pl-8 pr-4 align-middle relative">
                    <input
                      type="text"
                      placeholder=""
                      autoComplete="off"
                      className="w-full bg-ios-bg/50 border-none rounded-full px-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-bold text-black text-sm"
                      value={item.name}
                      onFocus={() => setActiveSuggestionRow(item.id)}
                      onChange={(e) => {
                        updateItem(item.id, 'name', e.target.value);
                        setActiveSuggestionRow(item.id);
                      }}
                    />
                    {activeSuggestionRow === item.id && (
                      <div ref={suggestionRef} className="absolute left-8 right-4 top-full mt-2 z-[70] min-w-[280px] max-w-full">
                        <div className="bg-[#1c1c1e] rounded-xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                            {products
                              .filter(p => p.name.toLowerCase().includes(item.name.toLowerCase()))
                              .map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => selectProduct(item.id, p)}
                                  className="w-full px-5 py-4 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-none group/item"
                                >
                                  <div className="font-bold text-[15px] text-white tracking-tight mb-1 group-hover/item:text-[#8ab4f8] transition-colors">{p.name}</div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[#8ab4f8] text-[12px] font-black">{getCurrencySymbol(invoice.currency || 'BDT')} {p.price.toLocaleString()}</span>
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/50">Stock: {p.stock}</span>
                                  </div>
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <div className="flex justify-center">
                      <input
                        type="number"
                        placeholder=""
                        className="w-full bg-ios-bg/50 border-none rounded-full px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-black text-sm text-center max-w-[80px]"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </td>
                  <td className="py-6 px-4 align-middle">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-[150px] group/price">
                        <input
                          type="number"
                          placeholder=""
                          className="w-full bg-ios-bg/50 border-none rounded-full pl-12 pr-6 py-3.5 focus:bg-white focus:ring-2 focus:ring-black/10 outline-none transition-all font-black text-black text-sm text-right"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-ios-gray/30 pointer-events-none uppercase">
                          {getCurrencySymbol(invoice.currency || 'BDT')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-right align-middle">
                    <span className="font-black text-gray-900 bg-ios-bg/30 px-6 py-3.5 rounded-full text-xs min-w-[100px] text-center inline-block">
                      {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-6 pr-8 text-right align-middle">
                    <button onClick={() => removeItem(item.id)} className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-ios-bg/10 border-t border-ios-separator/5">
          <button onClick={addItem} className="group flex items-center space-x-2 bg-white px-5 py-2.5 rounded-full ios-shadow border border-ios-separator/10 hover:border-black transition-all active:scale-95">
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white">+</div>
            <span className="font-black text-[11px] text-gray-700 uppercase tracking-widest">Add Item</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-ios-lg ios-shadow border border-ios-separator/10">
        <div className="flex flex-col md:flex-row items-center gap-x-16 gap-y-10">
          <div className="flex-1 w-full md:w-auto space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-ios-gray uppercase tracking-widest">Tax Rate (%)</span>
              <input
                type="number"
                className="w-28 bg-ios-bg/40 border border-ios-separator/20 rounded-full px-5 py-2.5 text-right outline-none focus:bg-white focus:ring-2 focus:ring-black/10 text-gray-900 font-black text-sm transition-all"
                value={invoice.taxRate}
                onChange={(e) => setInvoice({...invoice, taxRate: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="hidden md:block w-px h-24 bg-ios-separator/20"></div>
          <div className="flex-1 w-full md:w-auto flex flex-col justify-center items-end text-right">
            <span className="text-[11px] font-black text-black uppercase tracking-[0.2em] mb-1">Final Amount</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-black">{getCurrencySymbol(invoice.currency || 'BDT')}</span>
              <span className="text-6xl font-black text-gray-900 tracking-tighter leading-none">{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
