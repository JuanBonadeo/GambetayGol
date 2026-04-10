"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { formatPrice } from "@/types";

export interface CartItem {
  productId: string;
  variantId: string;
  nombre: string;
  talla: string;
  price: number;
  originalPrice: number;
  image: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { variantId: string } }
  | { type: "UPDATE_QTY"; payload: { variantId: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "OPEN" }
  | { type: "CLOSE" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.variantId === action.payload.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (i) => i.variantId !== action.payload.variantId
        ),
      };
    case "UPDATE_QTY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.variantId !== action.payload.variantId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  formattedTotal: string;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    dispatch({ type: "OPEN" });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { variantId } });
  }, []);

  const updateQty = useCallback((variantId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", payload: { variantId, quantity } });
  }, []);

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openCart = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE" }), []);

  const totalItems = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (acc, i) => acc + i.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        totalItems,
        totalPrice,
        formattedTotal: formatPrice(totalPrice),
        addItem,
        removeItem,
        updateQty,
        clear,
        openCart,
        closeCart,
      }}
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
