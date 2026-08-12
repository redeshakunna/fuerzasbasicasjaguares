"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CONTACT_EMAIL = "info@jaguarescordoba.com";

/**
 * Formulario de contacto — MVP sin backend propio: arma un mailto: con
 * los datos ingresados y abre el cliente de correo del usuario. Cuando
 * exista un endpoint real, solo hay que cambiar handleSubmit.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Contacto desde la web — ${name || "Sin nombre"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="rounded-[24px] bg-jaguar-white p-8 shadow-[0_1px_2px_rgba(13,18,16,0.04)] md:p-10"
    >
      <h2 className="font-display text-2xl uppercase leading-none tracking-tight text-jaguar-ink md:text-3xl">
        Escríbenos
      </h2>
      <p className="mt-3 text-[13.5px] leading-relaxed text-jaguar-ink/55">
        Completa el formulario y se abrirá tu correo con el mensaje listo para enviar.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <label htmlFor="name" className="text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-ink/60">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre completo"
            className="mt-2 w-full rounded-xl border border-jaguar-ink/12 bg-jaguar-mist/40 px-4 py-3 text-[14px] text-jaguar-ink outline-none transition-colors placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-ink/60">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="mt-2 w-full rounded-xl border border-jaguar-ink/12 bg-jaguar-mist/40 px-4 py-3 text-[14px] text-jaguar-ink outline-none transition-colors placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="text-[12px] font-bold uppercase tracking-[0.08em] text-jaguar-ink/60">
            Mensaje
          </label>
          <textarea
            id="message"
            required
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Cuéntanos en qué podemos ayudarte"
            className="mt-2 w-full resize-none rounded-xl border border-jaguar-ink/12 bg-jaguar-mist/40 px-4 py-3 text-[14px] text-jaguar-ink outline-none transition-colors placeholder:text-jaguar-ink/35 focus:border-jaguar-green-500"
          />
        </div>
      </div>

      <button
        type="submit"
        className="group mt-7 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-jaguar-green-600 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-jaguar-white shadow-[0_10px_30px_-10px_rgba(20,92,44,0.55)] transition-transform hover:scale-[1.02] sm:w-auto"
      >
        Enviar mensaje
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
      </button>
    </motion.form>
  );
}
