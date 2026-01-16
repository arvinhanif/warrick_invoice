
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import CreateInvoice from './pages/CreateInvoice.tsx';
import Settings from './pages/Settings.tsx';
import PreviewInvoice from './pages/PreviewInvoice.tsx';
import Customers from './pages/Customers.tsx';
import Products from './pages/Products.tsx';
import Settlement from './pages/Settlement.tsx';
import Login from './pages/Login.tsx';
import Navbar from './components/Navbar.tsx';
import { InvoiceData, BusinessInfo, Customer, Product, AuthUser } from './types.ts';

const App: React.FC = () => {
  const navigate = useNavigate();
  
  const getSafeJSON = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return defaultValue;
    }
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('warrick_dark_mode') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return getSafeJSON('warrick_auth', null);
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<AuthUser[]>(() => {
    return getSafeJSON('warrick_app_users', [{
      id: 'admin-01',
      role: 'Admin',
      name: 'Arvin Hanif',
      username: 'arvin_hanif',
      password: 'arvin_hanif',
      mobile: '01XXXXXXXXX',
      email: 'arvin@warrick.io'
    }]);
  });

  const [userBusiness, setUserBusiness] = useState<BusinessInfo>(() => {
    return getSafeJSON('warrick_business', {
      name: 'Warrick Studios',
      email: 'billing@warrick.io',
      phone: '+880 1XXX-XXXXXX',
      address: 'Gulshan, Dhaka, Bangladesh'
    });
  });

  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    return getSafeJSON('warrick_invoices', []);
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    return getSafeJSON('warrick_customers', []);
  });

  const [products, setProducts] = useState<Product[]>(() => {
    return getSafeJSON('warrick_products', []);
  });

  const [invoiceCounter, setInvoiceCounter] = useState<number>(() => {
    const saved = localStorage.getItem('warrick_invoice_counter');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('warrick_dark_mode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n': navigate('/create'); break;
          case 'd': navigate('/dashboard'); break;
          case 's': navigate('/settings'); break;
          case 'c': navigate('/customers'); break;
          case 'p': navigate('/products'); break;
          case 't': navigate('/settlement'); break;
          default: break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  useEffect(() => { localStorage.setItem('warrick_app_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('warrick_auth', JSON.stringify(currentUser));
    else localStorage.removeItem('warrick_auth');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('warrick_business', JSON.stringify(userBusiness)); }, [userBusiness]);
  useEffect(() => { localStorage.setItem('warrick_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('warrick_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('warrick_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('warrick_invoice_counter', invoiceCounter.toString()); }, [invoiceCounter]);

  const addInvoice = (invoice: InvoiceData) => {
    const nextNumber = invoiceCounter + 1;
    const formattedNumber = `#${nextNumber.toString().padStart(4, '0')}`;
    const finalInvoice = { ...invoice, invoiceNumber: formattedNumber };
    setInvoices(prev => [finalInvoice, ...prev]);
    setInvoiceCounter(nextNumber);
  };

  const updateInvoice = (updatedInvoice: InvoiceData) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Delete this record permanently?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-12 transition-colors duration-500">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-10">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard invoices={invoices} onDelete={deleteInvoice} customersCount={customers.length} globalSearchQuery={searchQuery} user={currentUser} />} />
          <Route path="/create" element={<CreateInvoice business={userBusiness} onSave={addInvoice} customers={customers} products={products} invoices={invoices} nextId={invoiceCounter + 1} onAddCustomer={(c) => setCustomers(p => [c, ...p])} />} />
          <Route path="/edit/:id" element={<CreateInvoice business={userBusiness} onSave={updateInvoice} invoices={invoices} customers={customers} products={products} onAddCustomer={(c) => setCustomers(p => [c, ...p])} />} />
          <Route path="/preview/:id" element={<PreviewInvoice invoices={invoices} />} />
          <Route path="/settings" element={
            <Settings 
              business={userBusiness} 
              onUpdate={setUserBusiness} 
              onLogout={() => setCurrentUser(null)} 
              user={currentUser} 
              onRegisterUser={(u) => setUsers(p => [...p, u])} 
              users={users} 
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(!darkMode)}
              onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              onUpdateUser={(updatedUser) => setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))}
            />
          } />
          <Route path="/customers" element={<Customers customers={customers} onAdd={(c) => setCustomers(p => [c, ...p])} onUpdate={(c) => setCustomers(p => p.map(x => x.id === c.id ? c : x))} onDelete={(id) => setCustomers(p => p.filter(x => x.id !== id))} globalSearchQuery={searchQuery} user={currentUser} />} />
          <Route path="/products" element={<Products products={products} onAdd={(p) => setProducts(x => [p, ...x])} onUpdate={(p) => setProducts(x => x.map(y => y.id === p.id ? p : y))} onDelete={(id) => setProducts(x => x.filter(y => y.id !== id))} globalSearchQuery={searchQuery} user={currentUser} />} />
          <Route path="/settlement" element={<Settlement invoices={invoices} products={products} user={currentUser} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
