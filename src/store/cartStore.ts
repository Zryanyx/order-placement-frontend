import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addItem: (product: Product, quantity = 1) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ items: [...items, { product, quantity }] });
    }
  },
  
  removeItem: (productId: number) => {
    set({ items: get().items.filter(item => item.product.id !== productId) });
  },
  
  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    set({
      items: get().items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  },
  
  getTotalCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));

