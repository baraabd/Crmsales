import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Service {
  id: string;
  name: string;
  category: 'packages' | 'services';
  price: number;
  description: string;
  duration: string; // in days
  portfolioUrl?: string;
  features: string[];
}

export interface CartItem {
  serviceId: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (serviceId: string) => void;
  removeFromCart: (serviceId: string) => void;
  updateQuantity: (serviceId: string, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartWithDetails: (services: Service[]) => Array<Service & { quantity: number }>;
  hasPackage: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (serviceId: string) => {
    setCartItems((prev) => {
      const existing = prev.find(item => item.serviceId === serviceId);
      if (existing) {
        return prev.map(item =>
          item.serviceId === serviceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { serviceId, quantity: 1 }];
    });
  };

  const removeFromCart = (serviceId: string) => {
    setCartItems((prev) => prev.filter(item => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map(item =>
        item.serviceId === serviceId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCartWithDetails = (services: Service[]) => {
    return cartItems.map(item => {
      const service = services.find(s => s.id === item.serviceId);
      return service ? { ...service, quantity: item.quantity } : null;
    }).filter(Boolean) as Array<Service & { quantity: number }>;
  };

  const hasPackage = () => {
    // This would need to check against actual services
    // For now, we'll implement it in the component
    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getCartWithDetails,
        hasPackage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
