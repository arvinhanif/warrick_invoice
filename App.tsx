
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import Settings from './pages/Settings';
import PreviewInvoice from './pages/PreviewInvoice';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Settlement from './pages/Settlement';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { InvoiceData, BusinessInfo, Customer, Product, AuthUser } from './types';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('warrick_dark_mode');
    return saved === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('warrick_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('warrick_app_users');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'admin-01',
      role: 'Admin',
      name: 'Arvin Hanif',
      username: 'arvin_hanif',
      password: 'arvin_hanif',
      mobile: '01XXXXXXXXX',
      email: 'arvin@warrick.io'
    }];
  });

  const [userBusiness, setUserBusiness] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem('warrick_business');
    return saved ? JSON.parse(saved) : {
      name: 'Warrick Studios',
      email: 'billing@warrick.io',
      phone: '+880 1XXX-XXXXXX',
      address: 'Gulshan, Dhaka, Bangladesh'
    };
  });

  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('warrick_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('warrick_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('warrick_products');
    return saved ? JSON.parse(saved) : [];
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
    localStorage.setItem('warrick_app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('warrick_auth', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('warrick_auth');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('warrick_business', JSON.stringify(userBusiness));
  }, [userBusiness]);

  useEffect(() => {
    localStorage.setItem('warrick_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('warrick_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('warrick_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('warrick_invoice_counter', invoiceCounter.toString());
  }, [invoiceCounter]);

  const addInvoice = (invoice: InvoiceData) => {
    const nextNumber = invoiceCounter + 1;
    const formattedNumber = `#${nextNumber.toString().padStart(4, '0')}`;
    const finalInvoice = {
      ...invoice,
      invoiceNumber: formattedNumber
    };
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

  const updateBusiness = (info: BusinessInfo) => {
    setUserBusiness(info);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Remove this staff member?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleUpdateUser = (updatedUser: AuthUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-12 transition-colors duration-500">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard invoices={invoices} onDelete={deleteInvoice} customersCount={customers.length} globalSearchQuery={searchQuery} user={currentUser} />} />
          <Route path="/create" element={<CreateInvoice business={userBusiness} onSave={addInvoice} customers={customers} products={products} invoices={invoices} nextId={invoiceCounter + 1} onAddCustomer={(c) => setCustomers(p => [c, ...p])} />} />
          <Route path="/edit/:id" element={<CreateInvoice business={userBusiness} onSave={updateInvoice} invoices={invoices} customers={customers} products={products} onAddCustomer={(c) => setCustomers(p => [c, ...p])} />} />
          <Route path="/preview/:id" element={<PreviewInvoice invoices={invoices} />} />
          <Route path="/settings" element={
            <Settings 
              business={userBusiness} 
              onUpdate={updateBusiness} 
              onLogout={handleLogout} 
              user={currentUser} 
              onRegisterUser={(u) => setUsers(p => [...p, u])} 
              users={users} 
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(!darkMode)}
              onDeleteUser={handleDeleteUser}
              onUpdateUser={handleUpdateUser}
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
