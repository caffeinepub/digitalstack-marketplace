import { type ReactNode, createContext, useContext, useState } from "react";
import type { ProductDTO } from "../backend.d";

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: ProductDTO) => void;
  removeItem: (productId: bigint) => void;
  clearCart: () => void;
  totalAmount: bigint;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: ProductDTO) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev;
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeItem(productId: bigint) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.priceInPaise * BigInt(item.quantity),
    0n,
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, totalAmount, totalCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
