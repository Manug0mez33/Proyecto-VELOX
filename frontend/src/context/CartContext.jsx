"use client";
// Client Component ("use client"): Maneja el estado global del carrito con Context API (R6), reactividad en el navegador, cálculo de totales y sincronización bidireccional con localStorage.

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

const CART_STORAGE_KEY = "velox_cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Cargar el estado persistido en localStorage al montar el componente en el cliente
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Error al leer el carrito desde localStorage:", error);
    } finally {
      setIsHydrated(true);
    }

    // Sincronización multi-pestaña: escuchar cambios en localStorage originados desde otras ventanas
    const handleStorageChange = (e) => {
      if (e.key === CART_STORAGE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(parsed)) {
            setItems(parsed);
          }
        } catch (error) {
          console.error("Error al sincronizar carrito desde otra pestaña:", error);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, []);

  // 2. Sincronizar cambios del carrito hacia localStorage tras la hidratación inicial
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      // Notificar a otras ventanas o componentes que escuchan eventos de storage
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("velox-cart-updated"));
      }
    } catch (error) {
      console.error("Error al persistir el carrito en localStorage:", error);
    }
  }, [items, isHydrated]);

  // 3. Agregar producto o variante al carrito
  const addToCart = useCallback((producto, cantidad = 1) => {
    const qty = Math.max(1, Math.floor(Number(cantidad)) || 1);
    const sku = producto.sku || producto.sku_referencia || `ITEM-${producto.id || Date.now()}`;
    const precio = Number(producto.precio_final ?? producto.precio_base ?? producto.precio) || 0;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => it.sku === sku);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + qty,
        };
        return updated;
      }

      const newItem = {
        id: producto.id,
        sku,
        nombre: producto.nombre || "Calzado VELOX",
        marca: producto.marca_detalle?.nombre || producto.marca?.nombre || producto.marca || "VELOX LAB",
        categoria: producto.categoria_detalle?.nombre || producto.categoria?.nombre || producto.categoria || "COMPETICIÓN",
        talle: producto.talle_seleccionado || producto.talle || "41",
        color: producto.color_seleccionado || producto.color || "NEO GREEN",
        precio,
        imagen_url: producto.imagen_portada || producto.imagenes?.[0]?.url || null,
        cantidad: qty,
      };

      return [...prevItems, newItem];
    });
  }, []);

  // 4. Eliminar un ítem por su SKU
  const removeFromCart = useCallback((sku) => {
    setItems((prevItems) => prevItems.filter((item) => item.sku !== sku));
  }, []);

  // 5. Modificar cantidad de un ítem existente
  const updateQuantity = useCallback((sku, nuevaCantidad) => {
    const qty = Number(nuevaCantidad);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(sku);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.sku === sku ? { ...item, cantidad: Math.floor(qty) } : item
      )
    );
  }, [removeFromCart]);

  // 6. Vaciar todo el carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // 7. Cálculos derivados memorizados (Rendimiento O(n))
  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (Number(item.precio) || 0) * (Number(item.cantidad) || 0),
        0
      ),
    [items]
  );

  const total = subtotal; // Envío bonificado en calzado Serie Carbon Pro VELOX

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      total,
      isHydrated,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, totalItems, subtotal, total, isHydrated, addToCart, updateQuantity, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook de consumo seguro de CartContext
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un <CartProvider>");
  }
  return context;
}
