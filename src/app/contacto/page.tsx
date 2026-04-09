"use client";

import { useState } from "react";
import Image from "next/image";
import PageTransition from "@/components/ui/PageTransition";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

type Consulta = "pedido" | "tallas" | "envios" | "otro";

const CONSULTAS: { value: Consulta; label: string }[] = [
  { value: "pedido", label: "CONSULTA SOBRE UN PEDIDO" },
  { value: "tallas", label: "CONSULTA DE TALLAS" },
  { value: "envios", label: "ENVÍOS Y ENTREGAS" },
  { value: "otro", label: "OTRO" },
];

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [mensaje, setMensaje] = useState("");

  const puedeEnviar = nombre.trim().length > 0 && consulta !== null;

  function handleEnviar() {
    const lineas: string[] = [];
    lineas.push("*CONSULTA — Gambeta y Gol*");
    lineas.push(`👤 Nombre: ${nombre}`);
    lineas.push(`📋 Consulta: ${CONSULTAS.find((c) => c.value === consulta)?.label}`);
    if (mensaje.trim()) {
      lineas.push(`💬 Detalle: ${mensaje.trim()}`);
    }
    const texto = encodeURIComponent(lineas.join("\n"));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${texto}`, "_blank");
  }

  return (
    <PageTransition>
      <div className="bg-[#131313] min-h-screen flex flex-col lg:flex-row">

        {/* Columna izquierda — formulario */}
        <div className="flex-1 flex flex-col pt-32 pb-16 px-6 md:px-16 xl:px-24">
          {/* Header */}
          <div className="pb-10 border-b border-[#474747]/20 mb-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-3">
              ESTAMOS PARA AYUDARTE
            </p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white">
              CONTACTO
            </h1>
          </div>

          {/* Form */}
          <div className="max-w-lg w-full space-y-8">
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
                className="w-full bg-[#1b1b1b] border border-[#474747]/40 text-white text-sm font-medium px-4 py-3 placeholder:text-[#474747] focus:outline-none focus:border-[#34b5fa]/50 transition-colors"
              />
            </div>

            {/* Tipo de consulta */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                ¿SOBRE QUÉ QUERÉS CONSULTAR?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONSULTAS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setConsulta(c.value)}
                    className={`py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest border transition-colors duration-150 ${
                      consulta === c.value
                        ? "bg-[#34b5fa] border-[#34b5fa] text-[#001e2c]"
                        : "bg-[#1b1b1b] border-[#474747]/40 text-[#c6c6c6] hover:border-[#474747]/80"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mensaje opcional */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#c6c6c6]">
                DETALLE (OPCIONAL)
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Contanos más sobre tu consulta..."
                rows={4}
                className="w-full bg-[#1b1b1b] border border-[#474747]/40 text-white text-sm font-medium px-4 py-3 placeholder:text-[#474747] focus:outline-none focus:border-[#34b5fa]/50 transition-colors resize-none"
              />
            </div>

            {/* CTA */}
            <div className="pt-2">
              <button
                onClick={handleEnviar}
                disabled={!puedeEnviar}
                className="w-full sm:w-auto px-10 py-4 bg-[#25D366] text-white text-sm font-black uppercase tracking-widest hover:bg-[#1ebe5a] transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <WhatsAppIcon />
                ENVIAR POR WHATSAPP
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#474747] mt-3">
                SE ABRIRÁ WHATSAPP CON TU MENSAJE LISTO PARA ENVIAR
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-16 pt-8 border-t border-[#474747]/20 space-y-4 max-w-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#474747]">
              TAMBIÉN PODÉS ESCRIBIRNOS DIRECTAMENTE
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#25D366] hover:text-[#1ebe5a] transition-colors"
            >
              <WhatsAppIcon />
              ABRIR WHATSAPP
            </a>
          </div>
        </div>

        {/* Columna derecha — foto full height */}
        <div className="hidden lg:block lg:w-[50%] xl:w-[60%] sticky top-0 h-screen">
          <Image
            src="/contacto.jpg"
            alt="Gambeta y Gol — Contacto"
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
          {/* Gradiente de fusión izquierda */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#131313] to-transparent" />
        </div>

      </div>
    </PageTransition>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
