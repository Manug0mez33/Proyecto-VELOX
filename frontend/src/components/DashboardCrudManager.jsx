"use client";
// Client Component: contenedor orquestador del panel administrativo para gestionar variantes SKU y reseñas.

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuthToken } from "../lib/useAuthToken";
import {
  PRODUCTOS_CATALOGO,
  SAMPLE_VARIANTES,
  SAMPLE_RESENAS,
} from "../lib/mockCatalog";
import Badge from "./Badge";
import VariantesCrudTab from "./VariantesCrudTab";
import ResenasCrudTab from "./ResenasCrudTab";

export { SAMPLE_VARIANTES };

export default function DashboardCrudManager({ onVariantesChange } = {}) {
  const [tabActiva, setTabActiva] = useState("variantes"); // "variantes" | "resenas"
  const { token, rol } = useAuthToken();

  // Estados de datos
  const [variantes, setVariantes] = useState(SAMPLE_VARIANTES);
  // Arranca vacío: las reseñas reales se piden al montar (antes la solapa mostraba las 2 de ejemplo).
  const [resenas, setResenas] = useState([]);
  const [resenasCargadas, setResenasCargadas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Cargar Variantes desde API
  const loadVariantes = useCallback(async () => {
    setLoading(true);
    try {
      // page_size=100: sin esto la API devuelve solo las primeras 10 variantes del inventario.
      const res = await api.getPaginated("/variantes/", { params: { page_size: 100 } });
      // Los datos de ejemplo quedan solo si la API no responde (catch).
      setVariantes(res.results);
    } catch (err) {
      console.warn("No se pudo sincronizar inventario con el servidor:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar Reseñas desde API
  const loadResenas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getPaginated("/resenas/", { params: { page_size: 100 } });
      const items = res?.results || (Array.isArray(res) ? res : []);
      if (Array.isArray(items)) {
        const enriched = items.map((r) => ({
          ...r,
          producto_nombre:
            r.producto_nombre ||
            PRODUCTOS_CATALOGO.find((p) => p.id === r.producto)?.nombre ||
            `Calzado #${r.producto}`,
        }));
        setResenas(enriched);
      }
    } catch (err) {
      console.warn("No se pudieron cargar reseñas del servidor:", err);
      // Solo si la API no responde se muestran las reseñas de ejemplo.
      setResenas(SAMPLE_RESENAS);
    } finally {
      setResenasCargadas(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tabActiva === "variantes") {
      loadVariantes();
    } else {
      loadResenas();
    }
  }, [tabActiva, loadVariantes, loadResenas]);

  // Las reseñas también se cargan al abrir el panel, para que el contador de la solapa sea real desde el inicio.
  useEffect(() => {
    loadResenas();
  }, [loadResenas]);

  // El EMPLEADO modera reseñas (editar/eliminar) pero no publica nuevas (el backend también lo bloquea).
  const puedePublicarResenas = rol !== "EMPLEADO";

  // Limpiar feedback tras 5 segundos
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Sincronizar inventario con el componente padre
  useEffect(() => {
    if (typeof onVariantesChange === "function") {
      onVariantesChange(variantes);
    }
  }, [variantes, onVariantesChange]);

  return (
    <div className="rounded-xl bg-[#1E1E1E] border border-[#2A2A2A] p-6 space-y-6">
      {/* 1. Cabecera del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">GESTIÓN DE INVENTARIO</Badge>
            <h2 className="font-heading text-lg sm:text-xl font-bold uppercase text-[#FFFFFF]">
              ADMINISTRACIÓN DE VARIANTES Y RESEÑAS
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            Control de inventario por talle y color, actualización de existencias y moderación de opiniones.
          </p>
        </div>

        {/* Pestañas */}
        <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-lg border border-[#2A2A2A]">
          <button
            onClick={() => setTabActiva("variantes")}
            className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              tabActiva === "variantes"
                ? "bg-[#39FF14] text-[#121212]"
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            👟 VARIANTES ({variantes.length})
          </button>
          <button
            onClick={() => setTabActiva("resenas")}
            className={`px-3 py-1.5 text-xs font-heading font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
              tabActiva === "resenas"
                ? "bg-[#39FF14] text-[#121212]"
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            ★ RESEÑAS ({resenasCargadas ? resenas.length : "…"})
          </button>
        </div>
      </div>

      {/* Banner de Feedback */}
      {feedback && (
        <div
          className={`rounded-lg p-3.5 text-xs flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-[#182914] border border-[#39FF14] text-[#39FF14]"
              : "bg-[#2A1515] border border-[#EF4444] text-[#FCA5A5]"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-75 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pestaña 1: Variantes */}
      {tabActiva === "variantes" && (
        <VariantesCrudTab
          variantes={variantes}
          setVariantes={setVariantes}
          loading={loading}
          loadVariantes={loadVariantes}
          token={token}
          setFeedback={setFeedback}
        />
      )}

      {/* Pestaña 2: Reseñas */}
      {tabActiva === "resenas" && (
        <ResenasCrudTab
          resenas={resenas}
          setResenas={setResenas}
          loading={loading}
          loadResenas={loadResenas}
          token={token}
          puedePublicarResenas={puedePublicarResenas}
          setFeedback={setFeedback}
        />
      )}
    </div>
  );
}
