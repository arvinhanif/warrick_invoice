
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import Settings from './pages/Settings';
import PreviewInvoice from './pages/PreviewInvoice';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import { InvoiceData, BusinessInfo, Customer, Product, AuthUser } from './types';

const App: React.FC = () => {
  // 1. Persistent Auth State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('warrick_auth');
    return saved ? JSON.parse(saved) : null;
  });

  // 2. Persistent Users List (Admin + Staff)
  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('warrick_app_users');
    if (saved) return JSON.parse(saved);
    // Initial Master Admin Credentials
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

  // 3. Persistent Business Profile
  const [userBusiness, setUserBusiness] = useState<BusinessInfo>(() => {
    const saved = localStorage.getItem('warrick_business');
    return saved ? JSON.parse(saved) : {
      name: 'Warrick Studios',
      email: 'billing@warrick.io',
      phone: '+880 1XXX-XXXXXX',
      address: 'Gulshan, Dhaka, Bangladesh'
    };
  });

  // 4. Persistent Invoice Records
  const [invoices, setInvoices] = useState<InvoiceData[]>(() => {
    const saved = localStorage.getItem('warrick_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // 5. Persistent Customer Directory
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('warrick_customers');
    return saved ? JSON.parse(saved) : [];
  });

  // 6. Persistent Product Inventory
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('warrick_products');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persistence Side Effects (Saving to LocalStorage) ---
  
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

  // --- Business Logic ---

  const adjustStock = (items: any[], isAddingInvoice: boolean) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      items.forEach(item => {
        const productIndex = updatedProducts.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
        if (productIndex !== -1) {
          if (isAddingInvoice) {
            updatedProducts[productIndex].stock -= item.quantity;
          }
        }
      });
      return updatedProducts;
    });
  };

  const addInvoice = (invoice: InvoiceData) => {
    setInvoices(prev => [invoice, ...prev]);
    adjustStock(invoice.items, true);
  };

  const updateInvoice = (updatedInvoice: InvoiceData) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Delete this record permanently?')) {
      const invoiceToDelete = invoices.find(inv => inv.id === id);
      if (invoiceToDelete) {
        setProducts(prevProducts => {
          const updated = [...prevProducts];
          invoiceToDelete.items.forEach(item => {
            const idx = updated.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());
            if (idx !== -1) updated[idx].stock += item.quantity;
          });
          return updated;
        });
      }
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const updateBusiness = (info: BusinessInfo) => {
    setUserBusiness(info);
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = (id: string) => {
    if (window.confirm('Remove this customer profile permanently?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Remove this product from inventory?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const registerUser = (newUser: AuthUser) => {
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If current logged in user is updated, update the auth state too
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    if (currentUser?.id === id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this user account?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} users={users} />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-12 bg-ios-bg selection:bg-black selection:text-white">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard invoices={invoices} onDelete={deleteInvoice} customersCount={customers.length} />} />
          <Route path="/create" element={<CreateInvoice business={userBusiness} onSave={addInvoice} customers={customers} products={products} invoices={invoices} />} />
          <Route path="/edit/:id" element={<CreateInvoice business={userBusiness} onSave={updateInvoice} invoices={invoices} customers={customers} products={products} />} />
          <Route path="/preview/:id" element={<PreviewInvoice invoices={invoices} />} />
          <Route path="/settings" element={<Settings business={userBusiness} onUpdate={updateBusiness} onLogout={handleLogout} user={currentUser} onRegisterUser={registerUser} users={users} onUpdateUser={updateUser} onDeleteUser={deleteUser} />} />
          <Route path="/customers" element={<Customers customers={customers} onAdd={addCustomer} onUpdate={updateCustomer} onDelete={deleteCustomer} />} />
          <Route path="/products" element={<Products products={products} onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
