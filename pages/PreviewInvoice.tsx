
import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceData } from '../types';

interface PreviewInvoiceProps {
  invoices: InvoiceData[];
}

const PreviewInvoice: React.FC<PreviewInvoiceProps> = ({ invoices }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoice = invoices.find(inv => inv.id === id);

  if (!invoice) return <div className="p-8 text-center font-bold">Invoice not found</div>;

  const getCurrencySymbol = (currency: string) => {
    return currency === 'BDT' ? '৳' : currency === 'USD' ? '$' : currency;
  };

  const symbol = getCurrencySymbol(invoice.currency);
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * (invoice.taxRate / 100);
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoiceRef.current) return;
    
    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: `Invoice_${invoice.invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        backgroundColor: '#FFFFFF'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().from(element).set(opt).save();
    } else {
      window.print();
    }
  };

  const handleSend = async () => {
    const summaryText = `Invoice ${invoice.invoiceNumber} from ${invoice.business.name}\nTotal: ${symbol} ${total.toLocaleString()}\nCustomer: ${invoice.customer.name}`;
    
    const shareData = {
      title: `Invoice ${invoice.invoiceNumber}`,
      text: summaryText,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Sharing failed, falling back to direct method', err);
        fallbackSend();
      }
    } else {
      fallbackSend();
    }
  };

  const fallbackSend = () => {
    const message = encodeURIComponent(`Hello ${invoice.customer.name}, here is your invoice ${invoice.invoiceNumber} from ${invoice.business.name}.\nTotal: ${symbol} ${total.toLocaleString()}\nLink: ${window.location.href}`);
    
    const isPhone = /^\+?\d+$/.test(invoice.customer.email?.replace(/\s/g, '') || '');
    if (isPhone && invoice.customer.email) {
      window.open(`https://wa.me/${invoice.customer.email.replace(/\s/g, '')}?text=${message}`, '_blank');
    } else {
      window.location.href = `mailto:${invoice.customer.email || ''}?subject=Invoice ${invoice.invoiceNumber}&body=${message}`;
    }
  };

  return (
    <div className="w-full space-y-8 animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex justify-between items-center no-print px-2 max-w-[210mm] mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-ios-gray font-bold hover:text-black transition-colors">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex bg-white rounded-full ios-shadow p-1 overflow-hidden border border-white/40">
            <button 
              onClick={handlePrint} 
              className="px-5 py-2 text-black rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-ios-bg transition-all active:bg-gray-200"
            >
              Print
            </button>
            <div className="w-px h-4 bg-gray-200 self-center"></div>
            <button 
              onClick={handleDownloadPDF} 
              className="px-5 py-2 text-black rounded-full font-bold text-[11px] uppercase tracking-wider hover:bg-ios-bg transition-all active:bg-gray-200"
            >
              PDF
            </button>
          </div>
          
          <button 
            onClick={handleSend}
            className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-[11px] uppercase tracking-widest ios-shadow hover:opacity-90 active:scale-95 transition-all"
          >
            Send
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet - Strictly forced to A4 dimensions (210mm x 297mm) */}
      <div 
        ref={invoiceRef} 
        className="bg-white shadow-2xl overflow-hidden print:shadow-none mx-auto flex flex-col invoice-container"
        style={{ 
          width: '210mm', 
          height: '297mm', 
          minWidth: '210mm', 
          minHeight: '297mm',
          maxWidth: '210mm',
          maxHeight: '297mm'
        }}
      >
        
        {/* Header Design */}
        <div className="relative h-[160px] flex shrink-0">
          <div className="bg-[#2B354F] w-[55%] h-full flex items-center px-12" style={{ clipPath: 'polygon(0 0, 100% 0, 78% 100%, 0% 100%)' }}>
            <div className="flex items-center space-x-3">
              {invoice.business.logo ? (
                <img src={invoice.business.logo} alt="Logo" className="h-10 w-auto object-contain invert" />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#98C03D] rounded-sm flex items-center justify-center font-black text-white text-lg italic shrink-0">W</div>
                  <div className="text-white">
                    <p className="font-black text-base leading-none tracking-tighter uppercase">{invoice.business.name.split(' ')[0]}</p>
                    <p className="text-[7px] font-bold opacity-70 tracking-widest uppercase truncate max-w-[120px]">Premium Service</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-[#98C03D] w-[10%] h-full -ml-[12%]" style={{ clipPath: 'polygon(22% 0, 100% 0, 78% 100%, 0% 100%)' }}></div>

          <div className="flex-1 flex flex-col justify-center items-end px-12 text-right">
            <h1 className="text-[#98C03D] text-5xl font-black tracking-tighter mb-2">INVOICE</h1>
            <div className="text-[9px] space-y-0.5 font-bold text-gray-500 uppercase tracking-wide">
              <p>Invoice No: <span className="text-gray-900 ml-3">#{(invoice.invoiceNumber || '0000').replace('#','')}</span></p>
              <p>Date: <span className="text-gray-900 ml-3">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            </div>
          </div>
        </div>

        <div className="px-12 py-10 flex-1 flex flex-col overflow-hidden">
          {/* Client & Sender Info */}
          <div className="grid grid-cols-2 gap-16 mb-10 shrink-0">
            <div>
              <p className="text-[#98C03D] text-[11px] font-black uppercase mb-3">Invoice To:</p>
              <h2 className="text-lg font-black text-gray-900 mb-1 leading-tight">{invoice.customer.name}</h2>
              <div className="text-[10px] text-gray-500 space-y-1 font-semibold leading-relaxed">
                <p className="max-w-[200px] line-clamp-2">{invoice.customer.address || 'No address provided'}</p>
                <p>Phone: {invoice.customer.email || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-[#98C03D] text-[11px] font-black uppercase mb-3 text-right">Invoice From:</p>
              <h2 className="text-lg font-black text-gray-900 mb-1 leading-tight text-right">{invoice.business.name}</h2>
              <div className="text-[10px] text-gray-500 space-y-1 font-semibold leading-relaxed text-right">
                <p className="max-w-[200px] line-clamp-2">{invoice.business.address}</p>
                <p>Tel: {invoice.business.phone}</p>
              </div>
            </div>
          </div>

          {/* Table Design - Strictly capped at 12 items for 1-page A4 safety */}
          <div className="flex-1 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-white text-[9px] font-black uppercase tracking-widest h-9">
                  <th className="bg-[#98C03D] text-center w-12 px-3">NO.</th>
                  <th className="bg-[#98C03D] text-left px-4">ITEM DESCRIPTION</th>
                  <th className="bg-[#2B354F] text-center w-28">PRICE</th>
                  <th className="bg-[#2B354F] text-center w-16">QTY</th>
                  <th className="bg-[#2B354F] text-right pr-6 w-28">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.slice(0, 12).map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-3 text-center text-gray-900 font-bold text-[11px]">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900 text-xs line-clamp-1 uppercase">{item.name}</p>
                    </td>
                    <td className="py-3 text-center text-gray-900 font-bold text-[11px]">{symbol} {item.price.toLocaleString()}</td>
                    <td className="py-3 text-center text-gray-900 font-bold text-[11px]">{item.quantity}</td>
                    <td className="py-3 text-right pr-6 text-gray-900 font-black text-[11px]">{symbol} {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoice.items.length > 12 && (
              <p className="text-[8px] text-gray-400 font-bold italic mt-2 text-center">* Some items truncated to fit A4 page limit.</p>
            )}
          </div>

          {/* Summary Section */}
          <div className="flex justify-between items-start mt-8 shrink-0 pb-10">
            <div className="flex-1 pr-10">
              {invoice.notes && (
                <div className="pt-2">
                  <p className="text-[#98C03D] text-[10px] font-black uppercase mb-1.5">Terms & Notes:</p>
                  <p className="text-[9px] text-gray-400 font-bold leading-relaxed max-w-[320px]">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="w-60 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-gray-600 px-1 uppercase tracking-tight">
                <span>Subtotal:</span>
                <span>{symbol} {subtotal.toLocaleString()}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-[10px] font-bold text-gray-600 px-1 uppercase tracking-tight">
                  <span>Vat ({invoice.taxRate}%):</span>
                  <span>{symbol} {tax.toLocaleString()}</span>
                </div>
              )}
              <div className="bg-[#98C03D] text-white flex justify-between items-center py-2.5 px-5 rounded-sm mt-3">
                <span className="font-black text-[10px] uppercase tracking-wider">Net Total:</span>
                <span className="font-black text-lg leading-none">{symbol} {total.toLocaleString()}</span>
              </div>
              <div className="pt-10 flex flex-col items-center">
                <div className="w-24 h-[1px] bg-gray-300 mb-1"></div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2B354F] py-5 px-12 flex items-center justify-between mt-auto shrink-0">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="bg-[#98C03D] p-1.5 rounded-full shrink-0">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </div>
              <span className="text-white text-[9px] font-bold tracking-tight">{invoice.business.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-[#98C03D] p-1.5 rounded-full shrink-0">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
              </div>
              <span className="text-white text-[9px] font-bold tracking-tight">{invoice.business.email}</span>
            </div>
          </div>
          <p className="text-white text-[10px] font-black tracking-tight italic uppercase opacity-80">Thank you for choosing us</p>
        </div>

      </div>
    </div>
  );
};

export default PreviewInvoice;
