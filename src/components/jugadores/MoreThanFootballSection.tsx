"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Compass, Target, Users } from "lucide-react";

const pillars = [
  {
    id: "disciplina",
    icon: Target,
    title: "Disciplina",
    description: "Fomentamos el compromiso, la responsabilidad y el respeto en cada entrenamiento.",
    image: "/hero/slide-02-proposito.jpg",
  },
  {
    id: "trabajo-equipo",
    icon: Users,
    title: "Trabajo en equipo",
    description: "Creemos en el poder colectivo para alcanzar grandes objetivos.",
    image: "/brand/Slider Banner.png",
  },
  {
    id: "proyeccion",
    icon: Compass,
    title: "Proyección",
    description: "Impulsamos el desarrollo deportivo y personal con visión de futuro.",
    image: "/brand/stadium-stock.jpg",
  },
];

/** "Más que fútbol" — formación integral, con fotos reales del club. */
export function MoreThanFootballSection() {
  return (
    <section className="relative overflow-hidden bg-jaguar-green-900 px-4 py-16 md:px-8 md:py-24 lg:px-12">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] [background:repeating-linear-gradient(115deg,white_0px,white_2px,transparent_2px,transparent_18px)]"
      />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="max-w-lg">
          <h2 className="font-display text-3xl uppercase leading-[0.95] tracking-tight text-jaguar-white md:text-4xl">
            Más que <span className="text-jaguar-green-400">fútbol</span>
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-jaguar-white/65">
            Formamos personas íntegras dentro y fuera de la cancha.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl bg-jaguar-white/5"
              >
                <div className="px-5 pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-jaguar-white/10 text-jaguar-green-400">
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <h3 className="mt-4 text-[13.5px] font-bold uppercase tracking-[0.04em] text-jaguar-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-jaguar-white/55">{pillar.description}</p>
                </div>
                <div className="relative mt-5 aspect-[4/3] w-full">
                  <Image
                    src={pillar.image}
                    alt={pillar.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
