"use client";

import { motion } from "framer-motion";
import { whyChooseUsItems } from "./nosotros.data";

/** "¿Por qué elegirnos?" — mismo lenguaje visual que Metodología en el home. */
export function WhyChooseUsSection() {
  return (
    <section className="bg-jaguar-mist/40 px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-2xl font-extrabold uppercase tracking-tight text-jaguar-ink md:text-3xl"
        >
          ¿Por qué{" "}
          <span className="relative text-jaguar-green-600">
            elegirnos?
            <span aria-hidden className="absolute inset-x-0 -bottom-1.5 h-[3px] rounded-full bg-jaguar-green-500" />
          </span>
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-12">
          {whyChooseUsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 rounded-2xl bg-jaguar-white p-6 shadow-[0_1px_2px_rgba(13,18,16,0.04)]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-jaguar-green-50 text-jaguar-green-600">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <h3 className="text-[13.5px] font-bold uppercase tracking-[0.03em] text-jaguar-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-jaguar-ink/55">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
