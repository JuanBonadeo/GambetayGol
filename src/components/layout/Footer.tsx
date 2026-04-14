import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0e0e0e] mt-24">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#34b5fa]/40 to-transparent" />

      <div className="max-w-[1600px] mx-auto px-6 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand column */}
          <div className="flex flex-col gap-6">
            <Link href="/" aria-label="Gambeta y Gol — Inicio">
              <Image
                src="/logo.svg"
                alt="Gambeta y Gol"
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-[11px] font-black uppercase tracking-widest text-[#474747] leading-relaxed max-w-[240px]">
              La tienda de camisetas de fútbol retro más exclusiva. Colecciones
              originales de todo el mundo.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-2">
              <SocialLink href="https://www.instagram.com/gambetaygol_/" label="Instagram">
                <InstagramIcon />
              </SocialLink>
              <SocialLink href="#" label="Facebook">
                <FacebookIcon />
              </SocialLink>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#34b5fa] mb-6">
              NAVEGACIÓN
            </p>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/", label: "Inicio" },
                { href: "/productos", label: "Productos" },
                { href: "/nosotros", label: "Nosotros" },
                { href: "/contacto", label: "Contacto" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-black uppercase text-[11px] tracking-widest text-[#c6c6c6] hover:text-white transition-colors duration-200 w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Info column */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#34b5fa] mb-6">
              INFORMACIÓN
            </p>
            <div className="flex flex-col gap-3">
              {[
                { href: "#", label: "Política de Privacidad" },
                { href: "/nosotros", label: "Términos y Condiciones" },
                { href: "/nosotros", label: "Política de Devoluciones" },
                { href: "#", label: "Preguntas Frecuentes" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="font-black uppercase text-[11px] tracking-widest text-[#c6c6c6] hover:text-white transition-colors duration-200 w-fit"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="h-px bg-[#474747]/20 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-black uppercase text-[9px] tracking-[0.15em] text-[#474747]">
            © {new Date().getFullYear()} GAMBETA Y GOL. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <p className="font-black uppercase text-[9px] tracking-[0.15em] text-[#474747]">
            HECHO CON{" "}
            <span className="text-[#34b5fa]">▲</span>{" "}
            EN ARGENTINA
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center bg-[#1f1f1f] text-[#c6c6c6] hover:bg-[#34b5fa] hover:text-[#001e2f] transition-all duration-200"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    >
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
