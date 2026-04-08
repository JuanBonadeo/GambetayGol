"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="bg-[#1b1b1b] py-24 px-6">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-[800px] mx-auto text-center"
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-[#34b5fa] mb-4">
          COMUNIDAD GAMBETA Y GOL
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase tracking-tighter text-white mb-4 leading-none">
          ÚNETE A LA
          <br />
          <span className="text-[#34b5fa]">COMUNIDAD</span>
        </h2>
        <p className="text-sm text-[#c6c6c6] uppercase tracking-wider mb-10">
          Drops exclusivos, preventas y contenido editorial.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 bg-[#34b5fa]/10 border border-[#34b5fa]/30 px-8 py-4"
          >
            <span className="text-[#34b5fa] font-black uppercase tracking-widest text-sm">
              ¡Bienvenido a la comunidad!
            </span>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="TU EMAIL"
              required
              className="flex-1 bg-[#353535] text-[#e2e2e2] placeholder:text-[#919191] placeholder:text-xs placeholder:tracking-[0.05em] placeholder:uppercase px-6 py-4 text-sm font-medium outline-none border-b-2 border-transparent focus:border-[#34b5fa] transition-colors duration-300"
            />
            <button
              type="submit"
              className="bg-white text-[#001e2c] font-black uppercase tracking-widest text-xs px-8 py-4 hover:bg-[#34b5fa] hover:text-[#001e2f] transition-colors duration-300 whitespace-nowrap"
            >
              SUSCRIBIRME
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
