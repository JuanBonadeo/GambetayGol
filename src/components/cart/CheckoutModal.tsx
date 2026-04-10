"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { formatPrice } from "@/types";
import type { CartItem } from "@/context/CartContext";

const COSTO_DOMICILIO = 10000;

type EnvioOpcion = "domicilio" | "sucursal";

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  totalPrice: number;
  mode?: "compra" | "encargo";
}

export default function CheckoutModal({ open, onClose, items, totalPrice, mode = "compra" }: Props) {
  const [nombre, setNombre] = useState("");
  const [esRosario, setEsRosario] = useState<boolean | null>(null);
  const [envioOpcion, setEnvioOpcion] = useState<EnvioOpcion>("sucursal");

  const isEncargo = mode === "encargo";

  const costoEnvio =
    !isEncargo && esRosario === false && envioOpcion === "domicilio" ? COSTO_DOMICILIO : 0;

  const totalFinal = totalPrice + costoEnvio;

  function buildWhatsAppMessage() {
    const lineas: string[] = [];

    if (isEncargo) {
      lineas.push("*ENCARGO - Gambeta y Gol*");
      lineas.push(`Nombre: ${nombre}`);
      lineas.push("");
      lineas.push("*Me gustaría encargar:*");
      items.forEach((item) => {
        lineas.push(`• ${item.nombre} | Talla: ${item.talla} | Precio ref.: ${formatPrice(item.price)}`);
      });
      lineas.push("");
      lineas.push("¿Podés confirmarme disponibilidad y tiempo de entrega?");
    } else {
      lineas.push("*NUEVO PEDIDO - Gambeta y Gol*");
      lineas.push(`Nombre: ${nombre}`);
      lineas.push("");
      lineas.push("*Productos:*");
      items.forEach((item) => {
        lineas.push(
          `• ${item.nombre} | Talla: ${item.talla} | Cant: ${item.quantity} | ${formatPrice(item.price * item.quantity)}`
        );
      });
      lineas.push("");
      if (esRosario) {
        lineas.push("Entrega: *Rosario* (envío gratis)");
      } else if (envioOpcion === "domicilio") {
        lineas.push(`Entrega: *A domicilio* (${formatPrice(COSTO_DOMICILIO)})`);
      } else {
        lineas.push("Entrega: *Sucursal Andriani* (envío gratis)");
      }
      lineas.push("");
      lineas.push(`*Total: ${formatPrice(totalFinal)}*`);
    }

    return encodeURIComponent(lineas.join("\n"));
  }

  function handleConfirmar() {
    const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const mensaje = buildWhatsAppMessage();
    window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
    onClose();
  }

  const puedeConfirmar = isEncargo
    ? nombre.trim().length > 0
    : nombre.trim().length > 0 && esRosario !== null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[71] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-md bg-[#1b1b1b] border border-[#474747]/30 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#474747]/20">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">
                    {isEncargo ? "HACER ENCARGO" : "FINALIZAR COMPRA"}
                  </h2>
                  {isEncargo && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] mt-0.5">
                      SIN STOCK — TE CONTACTAMOS PARA CONFIRMAR
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-[#c6c6c6] hover:text-white transition-colors p-1"
                  aria-label="Cerrar"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                    TU NOMBRE
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-[#2a2a2a] border border-[#474747]/40 text-white text-sm font-medium px-4 py-3 placeholder:text-[#474747] focus:outline-none focus:border-[#34b5fa]/50 transition-colors"
                  />
                </div>

                {/* Encargo: resumen del producto */}
                {isEncargo && items.length > 0 && (
                  <div className="bg-[#2a2a2a] border border-[#474747]/30 px-4 py-3 space-y-1">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight text-white">{item.nombre}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#474747]">TALLA: {item.talla}</p>
                        </div>
                        <span className="text-xs font-black text-[#c6c6c6]">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] pt-1">
                      PRECIO DE REFERENCIA — SUJETO A CONFIRMACIÓN
                    </p>
                  </div>
                )}

                {/* ¿Sos de Rosario? (solo compra) */}
                {!isEncargo && (
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                      ¿SOS DE ROSARIO?
                    </label>
                    <div className="flex gap-3">
                      <RadioBtn
                        label="Sí"
                        selected={esRosario === true}
                        onClick={() => setEsRosario(true)}
                      />
                      <RadioBtn
                        label="No"
                        selected={esRosario === false}
                        onClick={() => {
                          setEsRosario(false);
                          setEnvioOpcion("sucursal");
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Opciones envío (solo si NO es de Rosario, solo compra) */}
                {!isEncargo && (
                  <AnimatePresence>
                    {esRosario === false && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                            TIPO DE ENVÍO
                          </label>
                          <div className="space-y-2">
                            <EnvioBtn
                              label="SUCURSAL ANDRIANI"
                              sublabel="GRATIS"
                              selected={envioOpcion === "sucursal"}
                              onClick={() => setEnvioOpcion("sucursal")}
                              free
                            />
                            <EnvioBtn
                              label="A DOMICILIO"
                              sublabel={formatPrice(COSTO_DOMICILIO)}
                              selected={envioOpcion === "domicilio"}
                              onClick={() => setEnvioOpcion("domicilio")}
                            />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#474747]">
                            EL ENVÍO SE REALIZA POR ANDRIANI
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Info envío Rosario (solo compra) */}
                {!isEncargo && (
                  <AnimatePresence>
                    {esRosario === true && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#2a2a2a] border border-[#474747]/30 px-4 py-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa]">
                            ENVÍO GRATIS DENTRO DE ROSARIO
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Resumen total (solo compra) */}
                {!isEncargo && (
                  <div className="border-t border-[#474747]/20 pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                        PRODUCTOS
                      </span>
                      <span className="text-sm font-black text-white">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    {costoEnvio > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                          ENVÍO
                        </span>
                        <span className="text-sm font-black text-white">
                          {formatPrice(costoEnvio)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                        TOTAL
                      </span>
                      <span className="text-2xl font-black text-[#34b5fa] tracking-tighter">
                        {formatPrice(totalFinal)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleConfirmar}
                  disabled={!puedeConfirmar}
                  className="w-full py-4 bg-[#25D366] text-white text-sm font-black uppercase tracking-widest hover:bg-[#1ebe5a] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon />
                  {isEncargo ? "ENCARGAR POR WHATSAPP" : "CONFIRMAR PEDIDO POR WHATSAPP"}
                </button>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] text-center mt-3">
                  {isEncargo
                    ? "TE VAMOS A RESPONDER A LA BREVEDAD"
                    : "SE ABRIRÁ WHATSAPP CON TU PEDIDO LISTO PARA ENVIAR"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RadioBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border transition-colors duration-150 ${
        selected
          ? "bg-[#34b5fa] border-[#34b5fa] text-[#001e2c]"
          : "bg-[#2a2a2a] border-[#474747]/40 text-[#c6c6c6] hover:border-[#34b5fa]/50"
      }`}
    >
      {label}
    </button>
  );
}

function EnvioBtn({
  label,
  sublabel,
  selected,
  onClick,
  free,
}: {
  label: string;
  sublabel: string;
  selected: boolean;
  onClick: () => void;
  free?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 border transition-colors duration-150 ${
        selected
          ? "bg-[#2a2a2a] border-[#34b5fa]/60"
          : "bg-[#2a2a2a] border-[#474747]/30 hover:border-[#474747]/60"
      }`}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-white">
        {label}
      </span>
      <span
        className={`text-[10px] font-black uppercase tracking-widest ${
          free ? "text-[#34b5fa]" : "text-[#c6c6c6]"
        }`}
      >
        {sublabel}
      </span>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
