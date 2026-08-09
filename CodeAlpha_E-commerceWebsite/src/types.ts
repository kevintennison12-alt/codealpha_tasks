/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  savedAddresses: string[];
  role: 'user' | 'admin';
  createdDate: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number; // Percentage, e.g. 15 for 15% off
  category: string;
  stock: number;
  images: string[];
  rating: number;
  reviews: Review[];
  brand: string;
  specifications: { [key: string]: string };
}

export interface OrderItem {
  id: string; // matches product id
  name: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: string;
  billingAddress: string;
  paymentMethod: 'CreditCard' | 'UPI' | 'COD';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: OrderStatus;
  orderDate: string;
  totalAmount: number;
  couponCode?: string;
  discountAmount: number;
  gstAmount: number;
  shippingCost: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpend: number;
  description: string;
}

export interface SalesStat {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface CategoryShare {
  name: string;
  value: number; // percentage or sales count
}
