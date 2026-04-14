import PageTransition from "@/components/ui/PageTransition";

const SECCIONES = [
  {
    titulo: "QUIÉNES SOMOS",
    contenido:
      "Gambeta y Gol es un emprendimiento dedicado a la venta de camisetas deportivas y productos relacionados. Las imágenes publicadas en el sitio son fotografías reales tomadas por nosotros mismos de los productos ofrecidos. No obstante, pueden existir leves variaciones en colores o detalles debido a la iluminación, la configuración de pantalla del usuario u otros factores externos.",
  },
  {
    titulo: "PRECIOS",
    contenido:
      "Todos los precios están expresados en pesos argentinos (ARS) y pueden ser modificados sin previo aviso. El precio que se tomará como válido será el vigente al momento de confirmar la compra.",
  },
  {
    titulo: "PROCESO DE COMPRA",
    contenido:
      "Para realizar una compra, el usuario deberá seleccionar el producto deseado, completar sus datos personales, elegir el método de pago y confirmar el pedido. Una vez finalizado este proceso, se enviará una confirmación con el detalle de la operación. El pedido será procesado una vez que el pago haya sido correctamente acreditado.",
  },
  {
    titulo: "CAMISETAS POR ENCARGO",
    contenido:
      "En el caso de camisetas por encargo o personalizadas, se requerirá una seña previa equivalente al 25% del valor total del producto para iniciar el pedido. El saldo restante deberá abonarse antes de la entrega o envío.",
  },
  {
    titulo: "ENVÍOS",
    contenido:
      "Realizamos envíos a todo el país. Los tiempos de entrega son estimados y pueden variar según la ubicación del cliente y el servicio de logística. El costo de envío será informado antes de finalizar la compra.",
  },
  {
    titulo: "CAMBIOS Y DEVOLUCIONES",
    contenido:
      "En caso de necesitar un cambio, el cliente podrá solicitarlo dentro de los 10 días desde la recepción del producto. Para que el cambio sea válido, el producto deberá encontrarse sin uso y en las mismas condiciones en que fue entregado. Los costos de envío asociados a cambios correrán por cuenta del cliente, excepto en productos defectuosos o errores en el pedido. No se aceptan cambios ni devoluciones de productos personalizados.",
  },
  {
    titulo: "RESPONSABILIDAD",
    contenido:
      "Gambeta y Gol no se responsabiliza por demoras ocasionadas por el servicio de correo, ni por inconvenientes derivados de datos incorrectos proporcionados por el cliente o por el uso indebido de los productos.",
  },
  {
    titulo: "PRIVACIDAD",
    contenido:
      "Los datos personales brindados por los usuarios serán utilizados únicamente con fines comerciales relacionados a la compra y no serán compartidos con terceros, salvo en caso de obligación legal.",
  },
  {
    titulo: "PROPIEDAD INTELECTUAL",
    contenido:
      "Todo el contenido del sitio, incluyendo imágenes, textos y diseño, es propiedad de Gambeta y Gol y no puede ser utilizado sin autorización previa.",
  },
  {
    titulo: "MODIFICACIONES",
    contenido:
      "Gambeta y Gol se reserva el derecho de modificar estos términos y condiciones en cualquier momento, sin necesidad de previo aviso. Las modificaciones entrarán en vigencia desde su publicación en el sitio. Estos términos y condiciones se rigen por las leyes de la República Argentina.",
  },
];

export default function NosotrosPage() {
  return (
    <PageTransition>
      <div className="bg-[#131313] min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 xl:px-24 pt-32 pb-24">

          {/* Header */}
          <div className="pb-10 border-b border-[#474747]/20 mb-16">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-3">
              GAMBETA Y GOL
            </p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white mb-6">
              NOSOTROS
            </h1>
            <p className="text-sm font-medium text-[#c6c6c6] max-w-2xl leading-relaxed">
              Bienvenido/a a Gambeta y Gol. Al acceder y utilizar nuestro sitio web,
              aceptás los presentes términos y condiciones, los cuales regulan el uso
              de la página y la compra de los productos ofrecidos. Te recomendamos
              leerlos atentamente antes de realizar cualquier operación.
            </p>
          </div>

          {/* Secciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
            {SECCIONES.map((seccion) => (
              <div key={seccion.titulo} className="border-l-2 border-[#34b5fa]/30 pl-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-3">
                  {seccion.titulo}
                </p>
                <p className="text-sm text-[#c6c6c6] leading-relaxed font-medium">
                  {seccion.contenido}
                </p>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-20 pt-10 border-t border-[#474747]/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#474747]">
              ÚLTIMA ACTUALIZACIÓN — ABRIL 2025 · REPÚBLICA ARGENTINA
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
