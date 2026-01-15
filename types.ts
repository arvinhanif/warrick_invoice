
export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  role: 'Admin' | 'Staff';
  name: string;
  username: string;
  password?: string;
  mobile?: string;
  email?: string;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  business: BusinessInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  currency: string;
  taxRate: number;
  discount: number;
  notes: string;
  terms: string;
  status: 'Draft' | 'Sent' | 'Paid';
  warrantyDate?: string;
}

export enum Page {
  Landing = 'landing',
  Dashboard = 'dashboard',
  Create = 'create',
  Settings = 'settings',
  Preview = 'preview',
  Customers = 'customers',
  Products = 'products',
  Login = 'login'
}
