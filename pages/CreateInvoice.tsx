
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BusinessInfo, InvoiceData, InvoiceItem, Customer, Product } from '../types';

interface CreateInvoiceProps {
  business: BusinessInfo;
  onSave: (invoice: InvoiceData) => void;
  customers?: Customer[]; 
  invoices?: InvoiceData[];
  products?: Product[];
  nextId?: number;
  onAddCustomer?: (customer: Customer) => void;
}

const CreateInvoice: React.FC<CreateInvoiceProps> = ({ 
  business, 
  onSave, 
  customers = [], 
  invoices = [], 
  products = [], 
  nextId,
  onAddCustomer 
}) => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();

  const createDefaultInvoice = () => ({
    id: Math.random().toString(36).substr(2, 9),
    invoiceNumber: nextId ? `#${nextId.toString().padStart(4, '0')}` : '...',
    date: new Date().toISOString().split('T')[0],
    business: business,
    customer: { name: '', email: '', address: '' },
    items: [{ id: Math.random().toString(36).substr(2, 9), name: '', quantity: 1, price: 0 }],
    currency: 'BDT',
    taxRate: 0,
    status: 'Draft',
    notes: '' // Used for Mobile Number
  });

  const [invoice, setInvoice] = useState<Partial<InvoiceData>>(() => {
    if (!editId) {
      const savedDraft = localStorage.getItem('warrick_temp_draft');
      if (savedDraft) {
        try {
          return JSON.parse(savedDraft);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
    return createDefaultInvoice();
  });

  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details');

  useEffect(() => {
    if (!editId) {
      localStorage.setItem('warrick_temp_draft', JSON.stringify(invoice));
    }
  }, [invoice, editId]);

  useEffect(() => {
    if (editId) {
      const existing = invoices.find(inv => inv.id === editId);
      if (existing) setInvoice(existing);
    } else if (nextId && !localStorage.getItem('warrick_temp_draft')) {
      setInvoice(prev => ({ ...prev, invoiceNumber: `#${nextId.toString().padStart(4, '0')}` }));
    }
  }, [editId, invoices, nextId]);

  const handleSave = () => {
    if (!invoice.customer?.name) return alert("Client name is required.");
    if (!invoice.notes) return alert("Mobile Number is required.");

    const phoneNormalized = invoice.notes.replace(/\s/g, '');
    const exists = customers.find(c => c.phone.replace(/\s/g, '') === phoneNormalized);
    
    if (!exists && onAddCustomer) {
      onAddCustomer({
        id: Math.random().toString(36).substr(2, 9),
        name: invoice.customer.name,
        phone: invoice.notes,
        address: invoice.customer.address || '',
        createdAt: new Date().toISOString()
      });
    }

    onSave({ ...invoice } as InvoiceData);
    
    if (!editId) {
      localStorage.removeItem('warrick_temp_draft');
    }
    
    navigate('/dashboard');
  };

  const handleMobileChange = (mobile: string) => {
    setInvoice(prev => {
      const updated = { ...prev, notes: mobile };
      
      if (customers) {
        const matchedCustomer = customers.find(c => c.phone.replace(/\s/g, '') === mobile.replace(/\s/g, ''));
        if (matchedCustomer) {
          return {
            ...updated,
            customer: {
              ...prev.customer!,
              name: matchedCustomer.name,
              address: matchedCustomer.address
            }
          };
        }
      }
      return updated;
    });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => {
      const newItems = prev.items?.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'name' && products) {
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

  const calculateSubtotal = () => {
    return invoice.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  };

  return (
    <div className="max-w-[1000px] mx-auto py-4 animate-desktop">
      <div className="clay-card overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Header Section */}
        <div className="p-10 pb-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h2 className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Entry Station</h2>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Protocol Warrick-X</p>
             </div>
             <div className="flex items-center space-x-4">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document ID</p>
                  <p className="font-black text-gray-800 dark:text-white">{invoice.invoiceNumber}</p>
               </div>
               <button onClick={() => navigate('/dashboard')} className="w-12 h-12 tactile-btn !p-0 !rounded-2xl hover:bg-rose-50 hover:text-rose-500">✕</button>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => setActiveTab('details')}
              className={`tactile-btn px-12 h-[58px] transition-all ${activeTab === 'details' ? 'bg-[#1A1A1A] text-white !shadow-inner' : ''}`}
            >
              CLIENT INFO
            </button>
            <button 
              onClick={() => setActiveTab('items')}
              className={`tactile-btn px-12 h-[58px] transition-all ${activeTab === 'items' ? 'bg-[#1A1A1A] text-white !shadow-inner' : ''}`}
            >
              ITEMIZED LIST
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-3 bg-white dark:bg-[#242629] p-2 rounded-full shadow-sm px-6 h-[58px]">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Running Total:</span>
               <span className="font-black text-xl text-gray-900 dark:text-white">৳{calculateSubtotal().toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-10 py-10 flex-1">
          {activeTab === 'details' ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 ml-5 uppercase tracking-widest">Client Identity (Full Name)</label>
                  <div className="sunken-well px-8 py-5">
                    <input
                      type="text"
                      placeholder="e.g. Arvin Hanif"
                      className="bg-transparent w-full outline-none font-bold text-lg text-gray-800 dark:text-white"
                      value={invoice.customer?.name || ''}
                      onChange={(e) => setInvoice({...invoice, customer: {...invoice.customer!, name: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 ml-5 uppercase tracking-widest">Contact Protocol (Mobile)</label>
                  <div className="sunken-well px-8 py-5">
                    <input
                      type="tel"
                      placeholder="+880 1XXX XXXXXX"
                      className="bg-transparent w-full outline-none font-bold text-lg text-gray-800 dark:text-white"
                      value={invoice.notes || ''}
                      onChange={(e) => handleMobileChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-gray-500 ml-5 uppercase tracking-widest">Deployment Location (Address)</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    placeholder="Physical address or City"
                    className="bg-transparent w-full outline-none font-bold text-lg text-gray-800 dark:text-white"
                    value={invoice.customer?.address || ''}
                    onChange={(e) => setInvoice({...invoice, customer: {...invoice.customer!, address: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
               <div className="hidden md:flex px-6 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                 <div className="flex-1">Description</div>
                 <div className="w-40 text-center">Unit Price</div>
                 <div className="w-24 text-center">Qty</div>
                 <div className="w-32 text-right pr-14">Extended</div>
               </div>
               
               <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {invoice.items?.map((item, idx) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-4 items-center animate-desktop group">
                    <div className="flex-1 w-full sunken-well px-7 py-5">
                       <input 
                         type="text" 
                         className="bg-transparent w-full outline-none font-bold uppercase placeholder:normal-case" 
                         placeholder="Item description" 
                         value={item.name} 
                         onChange={e => updateItem(item.id, 'name', e.target.value)} 
                       />
                    </div>
                    <div className="w-full md:w-40 sunken-well px-6 py-5 text-center">
                       <input 
                         type="number" 
                         className="bg-transparent w-full outline-none font-black text-center" 
                         placeholder="Price"
                         value={item.price || ''} 
                         onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} 
                       />
                    </div>
                    <div className="w-full md:w-24 sunken-well px-4 py-5 text-center">
                       <input 
                         type="number" 
                         className="bg-transparent w-full outline-none font-black text-center" 
                         value={item.quantity} 
                         onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} 
                       />
                    </div>
                    <div className="hidden md:block w-32 text-right font-black text-indigo-500 px-4">
                       ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button 
                      onClick={() => setInvoice(p => ({...p, items: p.items?.filter(x => x.id !== item.id)}))} 
                      className="w-12 h-12 tactile-btn !p-0 text-rose-500 rounded-2xl hover:bg-rose-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
               </div>

              <button 
                onClick={() => setInvoice(prev => ({...prev, items: [...(prev.items || []), {id: Date.now().toString(), name: '', quantity: 1, price: 0}]}))} 
                className="w-full tactile-btn py-6 border-dashed border-2 bg-gray-50/50 dark:bg-white/5 opacity-80 hover:opacity-100 transition-all text-gray-500"
              >
                + APPEND NEW ENTRY ROW
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-gray-50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div 
                className={`mech-toggle ${invoice.status === 'Paid' ? 'active' : ''}`}
                onClick={() => setInvoice({...invoice, status: invoice.status === 'Paid' ? 'Draft' : 'Paid'})}
              >
                <div className="mech-knob"></div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Settlement Received</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <button 
               onClick={() => navigate('/dashboard')}
               className="tactile-btn px-10 py-5 text-gray-400"
             >
               DISCARD
             </button>
             <button 
               onClick={handleSave}
               className="tactile-btn bg-[#1A1A1A] text-white px-16 py-5 shadow-2xl hover:scale-105"
             >
               {editId ? 'COMMIT CHANGES' : 'EXECUTE SAVE'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
