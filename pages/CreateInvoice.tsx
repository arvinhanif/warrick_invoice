
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
    if (!invoice.customer?.name) return alert("Select or enter client name");
    if (!invoice.notes) return alert("Enter Mobile Number");

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

  return (
    <div className="max-w-[700px] mx-auto py-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="clay-card overflow-hidden flex flex-col min-h-[480px]">
        
        <div className="p-10 pb-0 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-black tracking-tighter text-[#1A1A1A] dark:text-white uppercase">INVOICE ENTRY</h2>
             <div className="flex items-center space-x-3">
               <button onClick={() => navigate('/dashboard')} className="w-10 h-10 tactile-btn !p-0">✕</button>
             </div>
          </div>
          
          <div className="flex items-end space-x-3 mb-8">
            <button 
              onClick={() => setActiveTab('details')}
              className={`tactile-btn px-10 h-[54px] ${activeTab === 'details' ? 'bg-[#1A1A1A] text-white' : ''}`}
            >
              CUSTOMER DETAILS
            </button>
            <button 
              onClick={() => setActiveTab('items')}
              className={`tactile-btn px-10 h-[54px] ${activeTab === 'items' ? 'bg-[#1A1A1A] text-white' : ''}`}
            >
              PRODUCT DETAILES
            </button>
            
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 ml-4 uppercase tracking-widest leading-none">Entry Serial</label>
              <div className="sunken-well px-6 h-[54px] flex items-center">
                <input
                  type="text"
                  readOnly
                  className="bg-transparent w-full outline-none font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  value={invoice.invoiceNumber}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 py-4 space-y-2 flex-1">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Client Name</label>
                  <div className="sunken-well px-8 py-5">
                    <input
                      type="text"
                      placeholder="Enter full name"
                      className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                      value={invoice.customer?.name || ''}
                      onChange={(e) => setInvoice({...invoice, customer: {...invoice.customer!, name: e.target.value}})}
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Mobile Number</label>
                  <div className="sunken-well px-8 py-5">
                    <input
                      type="tel"
                      placeholder="Enter Mobile Number"
                      className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                      value={invoice.notes || ''}
                      onChange={(e) => handleMobileChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black text-gray-400 ml-4 uppercase tracking-widest">Location</label>
                <div className="sunken-well px-8 py-5">
                  <input
                    type="text"
                    placeholder="Enter city or full address"
                    className="bg-transparent w-full outline-none font-bold text-gray-800 dark:text-white"
                    value={invoice.customer?.address || ''}
                    onChange={(e) => setInvoice({...invoice, customer: {...invoice.customer!, address: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
               {invoice.items?.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-center animate-in slide-in-from-left-4 duration-300">
                  <div className="flex-1 sunken-well px-6 py-4">
                     <input 
                       type="text" 
                       className="bg-transparent w-full outline-none font-bold uppercase placeholder:normal-case" 
                       placeholder="Product Name" 
                       value={item.name} 
                       onChange={e => updateItem(item.id, 'name', e.target.value)} 
                     />
                  </div>
                  <div className="w-28 sunken-well px-4 py-4 text-center">
                     <input 
                       type="number" 
                       className="bg-transparent w-full outline-none font-black text-center" 
                       placeholder="Price"
                       value={item.price || ''} 
                       onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} 
                     />
                  </div>
                  <div className="w-20 sunken-well px-2 py-4 text-center">
                     <input 
                       type="number" 
                       className="bg-transparent w-full outline-none font-black text-center" 
                       value={item.quantity} 
                       onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} 
                     />
                  </div>
                  <button 
                    onClick={() => setInvoice(p => ({...p, items: p.items?.filter(x => x.id !== item.id)}))} 
                    className="w-11 h-11 tactile-btn !p-0 text-red-500 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setInvoice(prev => ({...prev, items: [...(prev.items || []), {id: Date.now().toString(), name: '', quantity: 1, price: 0}]}))} 
                className="w-full tactile-btn py-5 border-dashed border-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                + ADD NEW ITEM ROW
              </button>
            </div>
          )}
        </div>

        <div className="p-8 pt-1 bg-gray-50 dark:bg-black/20 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className={`mech-toggle ${invoice.status === 'Paid' ? 'active' : ''}`}
                onClick={() => setInvoice({...invoice, status: invoice.status === 'Paid' ? 'Draft' : 'Paid'})}
              >
                <div className="mech-knob"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Paid Status</span>
            </div>
            <button 
              onClick={handleSave}
              className="tactile-btn bg-[#1A1A1A] text-white px-12 py-5 shadow-2xl"
            >
              {editId ? 'UPDATE RECORD' : 'SAVE INVOICE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
