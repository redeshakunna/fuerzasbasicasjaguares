import type { TrainingObjective } from "./session-types";

/**
 * Catálogo curado de ejercicios por objetivo — base del generador de
 * sesiones. Está construido sobre principios de formación juvenil que
 * comparten las metodologías de referencia (UEFA/FIFA, La Masia, Ajax,
 * Bayern Campus, Manchester City Academy): progresión analítico → global,
 * trabajo con oposición creciente, transferencia al juego real y desarrollo
 * técnico-táctico-físico-mental integrado (nunca aislado).
 *
 * Cada objetivo tiene 3 ejercicios (progresión analítico → combinado →
 * situacional/con oposición) más un partido aplicado. `requiredMaterials`
 * es lo mínimo indispensable — el generador adapta la sesión si algo no
 * está disponible.
 */

export interface ExerciseTemplate {
  name: string;
  requiredMaterials: string[];
  baseDurationShare: number; // proporción relativa dentro del bloque de ejercicios
  description: string;
  organization: string;
  objective: string;
  coachCorrections: string[];
  commonMistakes: string[];
  variants: string[];
}

export interface AppliedMatchTemplate {
  organization: string;
  rules: string;
  objective: string;
}

export interface ObjectiveContent {
  warmupFocus: string;
  exercises: [ExerciseTemplate, ExerciseTemplate, ExerciseTemplate];
  appliedMatch: AppliedMatchTemplate;
  indicators: string[];
}

export const objectiveContent: Record<TrainingObjective, ObjectiveContent> = {
  Técnica: {
    warmupFocus: "activación con balón: toques orientados, conducción con ambos perfiles y cambios de dirección.",
    exercises: [
      {
        name: "Circuito técnico de conducción y control orientado",
        requiredMaterials: ["Balones", "Conos"],
        baseDurationShare: 0.3,
        description:
          "Circuito individual con conos en slalom, cambios de ritmo y control orientado hacia el siguiente espacio libre, alternando perfil hábil y no hábil.",
        organization: "Estaciones paralelas de 4-5 jugadores cada una, con balón individual y rotación cada 2 pasadas.",
        objective: "Mejorar el primer contacto y la conducción bajo presión de tiempo.",
        coachCorrections: [
          "Cabeza levantada entre toque y toque para leer el espacio.",
          "Superficie de contacto correcta según el tipo de control (interior, planta, exterior).",
        ],
        commonMistakes: ["Balón demasiado lejos del cuerpo al conducir a velocidad.", "Mirar el balón en vez del entorno."],
        variants: ["Agregar un defensor pasivo al final del circuito.", "Incorporar pase a un compañero al finalizar el recorrido."],
      },
      {
        name: "Rondo 4v1 a dos toques",
        requiredMaterials: ["Balones", "Petos"],
        baseDurationShare: 0.35,
        description:
          "Posesión en espacio reducido, cuatro jugadores exteriores y un defensor central, máximo dos toques por jugador.",
        organization: "Cuadrado de 8x8 m aproximadamente, rotación del defensor al perder el balón el equipo poseedor.",
        objective: "Velocidad de circulación, orientación corporal antes de recibir y apoyo constante.",
        coachCorrections: ["Recibir con el cuerpo orientado hacia el espacio libre.", "Ofrecer líneas de pase diagonales, no solo laterales."],
        commonMistakes: ["Recibir de espaldas al espacio de juego.", "Pases predecibles siempre al mismo compañero."],
        variants: ["Reducir a un toque para jugadores más avanzados.", "Ampliar a 6v2 si el grupo necesita más éxito en la tarea."],
      },
      {
        name: "Posesión 5v5 + 2 comodines con condición técnica",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.35,
        description:
          "Posesión en espacio reducido con dos comodines neutrales que siempre juegan con el equipo que tiene el balón, límite de dos toques.",
        organization: "Espacio de aproximadamente 20x15 m delimitado con conos, dos equipos de 5 más 2 comodines.",
        objective: "Transferir la calidad técnica del ejercicio analítico a una situación con oposición real.",
        coachCorrections: ["Buscar el tercer hombre para romper líneas de presión.", "Ajustar el ritmo del pase a la presión del rival."],
        commonMistakes: ["Perder el balón por apresurar la salida bajo presión.", "Los comodines se quedan estáticos en vez de generar ángulos."],
        variants: ["Agregar un mini-objetivo (portería pequeña) para incentivar la progresión.", "Limitar a un toque los últimos 5 minutos."],
      },
    ],
    appliedMatch: {
      organization: "Partido 7v7 en espacio reducido con porterías.",
      rules: "Los goles solo valen si en la jugada participaron al menos tres jugadores distintos.",
      objective: "Consolidar la calidad técnica bajo presión y en situación real de juego.",
    },
    indicators: ["Pase", "Control", "Toma de decisiones", "Comunicación"],
  },

  Táctica: {
    warmupFocus: "activación con desplazamientos coordinados en pareja y reconocimiento de espacios.",
    exercises: [
      {
        name: "Superioridad posicional 3v1",
        requiredMaterials: ["Balones", "Conos"],
        baseDurationShare: 0.3,
        description:
          "Tres atacantes generan superioridad frente a un defensor en un cuadrado, priorizando el pase al espacio y el apoyo constante.",
        organization: "Cuadrado de 10x10 m, rotación del defensor cada 90 segundos o al recuperar el balón.",
        objective: "Reconocer y ocupar los espacios que genera la superioridad numérica.",
        coachCorrections: ["Amplitud entre los tres atacantes para abrir líneas de pase.", "Anticipar el próximo apoyo antes de recibir."],
        commonMistakes: ["Los tres atacantes se juntan en el mismo espacio.", "Pase sin mirar antes la posición del defensor."],
        variants: ["Cambiar a 4v2 para trabajar superioridad más compleja.", "Agregar un mini-objetivo a superar tras 4 pases."],
      },
      {
        name: "Juego de posición 7v7 por zonas",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.35,
        description:
          "El campo se divide en corredores/zonas; máximo dos jugadores de campo por zona para forzar ocupación racional del espacio.",
        organization: "Campo reducido dividido en 3 corredores y 3 líneas con conos, 7 jugadores por equipo.",
        objective: "Mejorar la estructura colectiva en fase de posesión y la lectura de líneas de pase.",
        coachCorrections: ["Respetar la zona asignada para mantener el equilibrio posicional.", "Buscar el cambio de orientación cuando el juego se cierra."],
        commonMistakes: ["Varios jugadores invadiendo la misma zona.", "No aprovechar el cambio de campo cuando está libre."],
        variants: ["Liberar las zonas y evaluar si el grupo mantiene la estructura sin líneas dibujadas.", "Agregar un comodín libre en zona central."],
      },
      {
        name: "Fase de ataque organizado 8v8 en media cancha",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description:
          "Situación de juego real en media cancha con líneas definidas (defensa/medio/ataque), trabajando la progresión organizada hacia el arco rival.",
        organization: "Media cancha con dos porterías, 8 jugadores por equipo distribuidos en tres líneas.",
        objective: "Aplicar los principios posicionales trabajados en una situación cercana al partido.",
        coachCorrections: ["Mantener las distancias entre líneas.", "Tomar decisiones rápidas cuando se rompe una línea rival."],
        commonMistakes: ["Líneas demasiado juntas o demasiado separadas.", "Perder la estructura al perder el balón (transición lenta)."],
        variants: ["Condicionar el inicio de jugada desde el arquero.", "Premiar con punto extra los goles que nacen desde atrás."],
      },
    ],
    appliedMatch: {
      organization: "Partido 8v8 en cancha completa o dos tercios de cancha.",
      rules: "Se felicita en voz alta cada vez que el equipo mantiene la estructura posicional tras perder el balón.",
      objective: "Consolidar los principios tácticos trabajados en un contexto competitivo real.",
    },
    indicators: ["Toma de decisiones", "Posesión del balón", "Marcaje", "Comunicación"],
  },

  Definición: {
    warmupFocus: "activación con remates suaves progresivos y coordinación de carrera de aproximación.",
    exercises: [
      {
        name: "Finalización tras conducción",
        requiredMaterials: ["Balones", "Porterías", "Conos"],
        baseDurationShare: 0.3,
        description:
          "El jugador conduce entre conos a velocidad progresiva y remata a portería con distintas superficies de contacto.",
        organization: "Filas paralelas frente a la portería, rotación tras cada remate, arquero real si hay disponible.",
        objective: "Mejorar la decisión y ejecución técnica del remate en carrera.",
        coachCorrections: ["Último toque de ajuste antes de rematar.", "Apoyo del pie de plantación apuntando al objetivo."],
        commonMistakes: ["Reducir la velocidad justo antes de rematar.", "Mirar la portería en vez del balón en el momento del impacto."],
        variants: ["Rematar de primera tras un pase filtrado en vez de conducir.", "Agregar remate con el perfil no dominante."],
      },
      {
        name: "Definición con centro lateral (2v1 + portero)",
        requiredMaterials: ["Balones", "Porterías", "Conos"],
        baseDurationShare: 0.35,
        description:
          "Un jugador centra desde banda mientras dos atacantes disputan la definición contra un defensor y el arquero.",
        organization: "Grupos de 4 (2 atacantes, 1 defensor, rotación de centrador), portería con arquero.",
        objective: "Coordinar el timing de llegada al área y la definición bajo presión defensiva.",
        coachCorrections: ["Llegada al área en momentos distintos (primer y segundo palo).", "Definir rápido, sin toques innecesarios en el área."],
        commonMistakes: ["Los dos atacantes llegan al mismo espacio y se estorban.", "Centro sin velocidad ni dirección clara."],
        variants: ["Cambiar el centro por un pase raso.", "Sumar un segundo defensor para exigir más precisión."],
      },
      {
        name: "Partido con definición condicionada",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description:
          "Juego reducido donde el gol solo es válido si se define dentro del área en máximo tres toques.",
        organization: "Espacio reducido con área marcada, dos equipos con arquero.",
        objective: "Transferir la calidad de definición a una situación real con presión y tiempo limitado.",
        coachCorrections: ["Buscar el remate antes de que se cierre el ángulo.", "Aprovechar rebotes y segundas jugadas."],
        commonMistakes: ["Exceso de toques dentro del área por falta de decisión.", "No ocupar el área tras un centro o pase filtrado."],
        variants: ["Sumar doble puntaje a los goles de cabeza.", "Reducir a dos toques máximo dentro del área."],
      },
    ],
    appliedMatch: {
      organization: "Partido 6v6 con porterías reglamentarias y arqueros.",
      rules: "Cada gol se comenta en voz alta señalando qué decisión técnica lo hizo posible.",
      objective: "Consolidar la definición en condiciones reales de partido.",
    },
    indicators: ["Definición", "Toma de decisiones", "Intensidad"],
  },

  Posesión: {
    warmupFocus: "activación con pase y control orientado en movimiento constante.",
    exercises: [
      {
        name: "Rondo 5v2",
        requiredMaterials: ["Balones", "Petos"],
        baseDurationShare: 0.3,
        description: "Posesión clásica en círculo o cuadrado, cinco jugadores exteriores contra dos defensores centrales.",
        organization: "Espacio de 12x12 m aproximadamente, rotación de defensores al perder el balón el equipo poseedor.",
        objective: "Velocidad de circulación y apoyo permanente para mantener el balón.",
        coachCorrections: ["Ofrecer apoyo antes de que el compañero reciba.", "Variar el ritmo del pase para desequilibrar a los defensores."],
        commonMistakes: ["Apoyos demasiado cerca del portador del balón.", "Perder el balón por pases sin fuerza suficiente."],
        variants: ["Reducir a un toque.", "Aumentar a 6v3 para grupos más numerosos."],
      },
      {
        name: "Posesión 6v6+3 comodines",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.35,
        description: "Mantener la posesión con apoyo de tres comodines neutrales, objetivo de llegar a 10 pases consecutivos.",
        organization: "Espacio de 25x20 m delimitado con conos.",
        objective: "Sostener la posesión bajo presión organizada del rival durante secuencias largas.",
        coachCorrections: ["Cambiar el lado de juego cuando la presión se concentra.", "Usar a los comodines para romper líneas de presión."],
        commonMistakes: ["Circular el balón sin intención de progresar.", "No aprovechar los espacios que deja el rival al presionar."],
        variants: ["Sumar un punto extra si el equipo llega a 10 pases sin perder el balón.", "Reducir el espacio para aumentar la exigencia técnica."],
      },
      {
        name: "Posesión con transición a portería",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description:
          "El equipo debe completar ocho pases consecutivos antes de poder atacar una portería con arquero.",
        organization: "Medio campo con dos porterías, dos equipos con transición libre tras recuperar.",
        objective: "Unir la paciencia de la posesión con la decisión de progresar hacia el gol en el momento correcto.",
        coachCorrections: ["Reconocer el momento exacto para romper la posesión y atacar el espacio.", "Mantener la calma bajo presión antes de progresar."],
        commonMistakes: ["Progresar antes de tiempo y perder el balón en zona de riesgo.", "Exceso de pases horizontales sin intención de avanzar."],
        variants: ["Reducir a 6 pases para acelerar el ritmo de juego.", "Permitir progresión inmediata tras robo en campo rival."],
      },
    ],
    appliedMatch: {
      organization: "Partido 7v7 en cancha reducida con porterías.",
      rules: "Cada racha de 6 pases consecutivos sin perder el balón suma un punto extra al marcador.",
      objective: "Consolidar la posesión con propósito, no solo circulación sin sentido.",
    },
    indicators: ["Posesión del balón", "Pase", "Comunicación", "Toma de decisiones"],
  },

  Transiciones: {
    warmupFocus: "activación con cambios de ritmo explosivos y reacciones a estímulos.",
    exercises: [
      {
        name: "Transición ofensiva 4v4+4",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.3,
        description:
          "Al recuperar el balón, el equipo defensor debe atacar de inmediato apoyándose en 4 comodines exteriores.",
        organization: "Espacio de 20x15 m, comodines fijos en los laterales que siempre juegan con el equipo atacante.",
        objective: "Reaccionar con velocidad de decisión apenas se recupera el balón.",
        coachCorrections: ["Primer pase rápido y hacia adelante tras la recuperación.", "Ocupar el espacio libre de inmediato, sin dudar."],
        commonMistakes: ["Demorar la reacción tras recuperar el balón.", "Buscar el pase seguro hacia atrás en vez de progresar."],
        variants: ["Sumar un mini-objetivo a atacar tras la recuperación.", "Limitar el tiempo de reacción a 3 segundos."],
      },
      {
        name: "Transición defensiva con reaparición inmediata",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.35,
        description:
          "Juego 3v3 donde, al perder el balón, el equipo debe presionar de inmediato para recuperar antes de 5 segundos.",
        organization: "Espacio reducido de 15x12 m, cronómetro visible para marcar la ventana de presión.",
        objective: "Reducir el tiempo de reacción defensiva inmediatamente después de la pérdida.",
        coachCorrections: ["El jugador más cercano al balón presiona primero, sin esperar.", "Cerrar líneas de pase mientras se presiona al portador."],
        commonMistakes: ["Reclamar la pérdida en vez de reaccionar de inmediato.", "Presión individual sin apoyo de los compañeros cercanos."],
        variants: ["Reducir la ventana de presión a 4 segundos para jugadores más avanzados.", "Aumentar el espacio si el grupo no logra la tarea."],
      },
      {
        name: "Partido con gol relámpago",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description: "Los goles solo valen si se anotan dentro de los primeros seis segundos tras recuperar el balón.",
        organization: "Espacio reducido con dos porterías, juego libre con esta única condición.",
        objective: "Transferir la velocidad de decisión en la transición a una situación de juego real.",
        coachCorrections: ["Buscar la verticalidad inmediata tras el robo.", "Aprovechar el desorden defensivo del rival tras perder el balón."],
        commonMistakes: ["Perder tiempo asegurando el balón en vez de progresar.", "No anticipar el contragolpe estando en fase ofensiva."],
        variants: ["Ampliar la ventana a 8 segundos si el grupo es más joven.", "Sumar doble punto a los goles de transición defensiva a ofensiva."],
      },
    ],
    appliedMatch: {
      organization: "Partido 7v7 en espacio reducido con porterías.",
      rules: "Cada transición rápida y efectiva (menos de 8 segundos tras recuperar) se destaca en voz alta.",
      objective: "Consolidar la velocidad de reacción en ambas transiciones dentro del juego real.",
    },
    indicators: ["Velocidad", "Intensidad", "Toma de decisiones", "Comunicación"],
  },

  Fuerza: {
    warmupFocus: "activación general con movilidad articular y trabajo de core progresivo.",
    exercises: [
      {
        name: "Circuito de fuerza funcional con peso corporal",
        requiredMaterials: [],
        baseDurationShare: 0.3,
        description:
          "Circuito de 5 estaciones con sentadillas, zancadas, plancha, salto horizontal y elevaciones de cadera, priorizando técnica sobre velocidad de ejecución.",
        organization: "5 estaciones rotativas, 30 segundos de trabajo por 30 de descanso, grupos de 4-5 jugadores.",
        objective: "Desarrollar fuerza de base respetando la técnica de ejecución en jugadores en formación.",
        coachCorrections: ["Rodillas alineadas con los pies en sentadillas y zancadas.", "Espalda neutra durante la plancha, sin hundir la cadera."],
        commonMistakes: ["Sacrificar la técnica por hacer más repeticiones.", "Contener la respiración durante el esfuerzo."],
        variants: ["Agregar sobrecarga liviana si hay pesas disponibles.", "Convertirlo en circuito por tiempo total en vez de repeticiones."],
      },
      {
        name: "Fuerza-resistencia con bandas elásticas",
        requiredMaterials: ["Bandas elásticas", "Balones"],
        baseDurationShare: 0.35,
        description:
          "Trabajo de pases resistidos, saltos laterales con banda y estabilización de tobillo/rodilla usando bandas elásticas.",
        organization: "Parejas o estaciones individuales con banda elástica, 3 series de 10-12 repeticiones por ejercicio.",
        objective: "Fortalecer la musculatura estabilizadora relevante para la prevención de lesiones en fútbol juvenil.",
        coachCorrections: ["Control excéntrico del movimiento, no solo la fase concéntrica.", "Mantener tensión constante en la banda durante todo el recorrido."],
        commonMistakes: ["Usar impulso en vez de control muscular.", "Banda con tensión insuficiente para el nivel del jugador."],
        variants: ["Sin bandas: sustituir por ejercicios de salto y aterrizaje controlado.", "Aumentar repeticiones para jugadores de categorías mayores."],
      },
      {
        name: "Circuito de fuerza aplicada al gesto de juego",
        requiredMaterials: ["Balones", "Conos"],
        baseDurationShare: 0.35,
        description:
          "Duelos cuerpo a cuerpo por la posesión del balón, protección de balón contra un defensor y arrastres con resistencia del compañero.",
        organization: "Parejas o tríos en espacios reducidos delimitados con conos.",
        objective: "Transferir la fuerza de base a situaciones reales de contacto y protección de balón del fútbol.",
        coachCorrections: ["Cuerpo entre el balón y el rival al proteger.", "Base de sustentación amplia en los duelos."],
        commonMistakes: ["Perder el equilibrio por una base de apoyo demasiado estrecha.", "Usar los brazos de forma antirreglamentaria en vez del cuerpo."],
        variants: ["Aumentar el tiempo de disputa por balón.", "Trabajar duelos aéreos si el grupo lo requiere."],
      },
    ],
    appliedMatch: {
      organization: "Partido 6v6 en espacio reducido, permitiendo el contacto reglamentario.",
      rules: "Se valora especialmente ganar los duelos individuales y proteger el balón bajo presión física.",
      objective: "Aplicar la fuerza desarrollada a situaciones reales de disputa del balón.",
    },
    indicators: ["Intensidad", "Disciplina", "Actitud ante el error"],
  },

  Velocidad: {
    warmupFocus: "activación neuromuscular con skipping, taloneo y aceleraciones progresivas cortas.",
    exercises: [
      {
        name: "Sprints cortos con salida reactiva",
        requiredMaterials: ["Conos", "Cronómetro"],
        baseDurationShare: 0.3,
        description: "Series de 5, 10 y 15 metros con salida a partir de un estímulo (visual o auditivo del entrenador), recuperación completa entre series.",
        organization: "Filas de 3-4 jugadores en línea de salida, un cono como referencia de distancia.",
        objective: "Mejorar la velocidad de reacción y la aceleración en distancias cortas, propias del fútbol.",
        coachCorrections: ["Inclinación del tronco hacia adelante en la salida.", "Brazos activos coordinados con el movimiento de piernas."],
        commonMistakes: ["Pararse erguido en la salida, perdiendo aceleración inicial.", "No respetar la recuperación completa entre series (fatiga acumulada)."],
        variants: ["Salida desde distintas posiciones (sentado, de espaldas).", "Agregar balón en la última fase del sprint."],
      },
      {
        name: "Velocidad con cambio de dirección",
        requiredMaterials: ["Conos", "Estacas"],
        baseDurationShare: 0.35,
        description: "Circuito en forma de T o Z con cambios de dirección a máxima velocidad entre conos y estacas.",
        organization: "Circuitos individuales paralelos, 3-4 repeticiones por jugador con pausa completa.",
        objective: "Desarrollar la capacidad de acelerar, desacelerar y volver a acelerar en otra dirección.",
        coachCorrections: ["Bajar el centro de gravedad antes de cada cambio de dirección.", "Apoyo del pie contrario a la dirección del giro."],
        commonMistakes: ["Perder velocidad excesiva antes del cambio de dirección.", "Zancadas demasiado largas al frenar, afectando el equilibrio."],
        variants: ["Agregar balón para trabajar velocidad con conducción.", "Convertir en carrera de relevos por equipos."],
      },
      {
        name: "Carreras de velocidad con balón hacia portería",
        requiredMaterials: ["Balones", "Porterías", "Conos"],
        baseDurationShare: 0.35,
        description: "El jugador recibe un pase filtrado y debe alcanzar la máxima velocidad posible antes de definir a portería.",
        organization: "Filas frente a la mitad de cancha, pase filtrado del entrenador o un compañero, arquero si está disponible.",
        objective: "Transferir la velocidad pura a una situación de definición real.",
        coachCorrections: ["Mantener el control del balón sin reducir la velocidad de carrera.", "Ajustar la zancada en el último tramo antes de definir."],
        commonMistakes: ["Perder el balón por llevarlo demasiado lejos del cuerpo a alta velocidad.", "Frenar antes de tiempo por miedo a perder el control."],
        variants: ["Agregar un defensor en persecución para exigir más.", "Cambiar el pase filtrado por un rebote."],
      },
    ],
    appliedMatch: {
      organization: "Partido 6v6 en espacio amplio que favorezca las carreras en profundidad.",
      rules: "Se premian especialmente las jugadas que aprovechan el espacio a la espalda de la defensa.",
      objective: "Consolidar la velocidad trabajada en situaciones reales de profundidad y contragolpe.",
    },
    indicators: ["Velocidad", "Intensidad", "Toma de decisiones"],
  },

  Recuperación: {
    warmupFocus: "activación muy suave, movilidad articular y trote regenerativo.",
    exercises: [
      {
        name: "Trabajo aeróbico ligero y movilidad",
        requiredMaterials: [],
        baseDurationShare: 0.3,
        description: "Trote suave continuo combinado con ejercicios de movilidad articular activa (cadera, tobillo, hombros).",
        organization: "Grupo completo en desplazamiento libre por el espacio disponible, ritmo conversacional.",
        objective: "Favorecer la recuperación activa y la circulación sin generar fatiga adicional.",
        coachCorrections: ["Mantener un ritmo bajo, siempre por debajo de la exigencia de un partido.", "Respiración controlada y relajada durante todo el bloque."],
        commonMistakes: ["Acelerar el ritmo por competitividad entre compañeros.", "Movilidad ejecutada con rebotes bruscos en vez de control."],
        variants: ["Sustituir el trote por desplazamientos laterales suaves.", "Incluir respiración guiada al finalizar."],
      },
      {
        name: "Rondo suave sin presión alta",
        requiredMaterials: ["Balones", "Petos"],
        baseDurationShare: 0.35,
        description: "Posesión de baja intensidad en espacio amplio, sin presión agresiva, priorizando el toque de balón y la conexión grupal.",
        organization: "Grupos de 6-8 jugadores en espacio amplio, sin cronómetro ni presión competitiva.",
        objective: "Mantener el contacto con el balón y la cohesión grupal sin acumular carga física.",
        coachCorrections: ["Ritmo de pase relajado, sin buscar velocidad.", "Aprovechar el espacio amplio para no generar disputas físicas."],
        commonMistakes: ["El grupo compite igual que en un rondo normal (intensidad no controlada).", "Espacio demasiado reducido, generando contacto físico innecesario."],
        variants: ["Trabajar solo con el perfil no dominante para variar el estímulo.", "Sustituir por juegos de habilidad sin oposición."],
      },
      {
        name: "Partido reducido de baja exigencia física",
        requiredMaterials: ["Balones", "Petos"],
        baseDurationShare: 0.35,
        description: "Juego libre en espacio amplio con foco exclusivamente técnico, sin exigencia de intensidad física.",
        organization: "Espacio amplio con equipos reducidos, sin condicionamientos de presión o velocidad.",
        objective: "Cerrar la sesión con contacto real de balón sin comprometer la recuperación física del plantel.",
        coachCorrections: ["Recordar constantemente bajar el ritmo si sube la intensidad.", "Priorizar la calidad técnica sobre el resultado del juego."],
        commonMistakes: ["Los jugadores compiten como en un partido normal.", "El entrenador deja que la intensidad suba sin intervenir."],
        variants: ["Reducir a posesión libre sin arcos si el grupo compite demasiado.", "Finalizar antes de tiempo si se detecta fatiga."],
      },
    ],
    appliedMatch: {
      organization: "Juego libre y distendido en espacio amplio, sin marcador.",
      rules: "Sin condiciones de presión — el objetivo es la recuperación, no la competencia.",
      objective: "Cerrar la sesión favoreciendo la regeneración física y mental del plantel.",
    },
    indicators: ["Actitud ante el error", "Comunicación", "Disciplina"],
  },

  "Partido reducido": {
    warmupFocus: "activación con posesión en espacio reducido a baja presión.",
    exercises: [
      {
        name: "Posesión en espacio reducido (preparación)",
        requiredMaterials: ["Balones", "Petos", "Conos"],
        baseDurationShare: 0.3,
        description: "Posesión 4v4 en espacio muy reducido para elevar progresivamente la velocidad de decisión antes del partido reducido principal.",
        organization: "Espacio de 12x10 m delimitado con conos, dos equipos de 4.",
        objective: "Preparar la velocidad de decisión que exigirá el espacio reducido del partido.",
        coachCorrections: ["Decisión rápida antes de recibir (pensar antes de que llegue el balón).", "Protección del balón inmediata al recibir bajo presión."],
        commonMistakes: ["Pensar la jugada recién al recibir el balón.", "Espacio demasiado amplio para el número de jugadores."],
        variants: ["Limitar a dos toques.", "Agregar mini-porterías para dar dirección al juego."],
      },
      {
        name: "Partido reducido 4v4 con porterías pequeñas",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description: "Partido en espacio reducido con porterías pequeñas sin arquero, fomentando la participación constante de todos los jugadores.",
        organization: "Espacio de 20x15 m con dos porterías pequeñas, cambios de equipo cada 6-8 minutos.",
        objective: "Maximizar el número de contactos con el balón y las situaciones de decisión por jugador.",
        coachCorrections: ["Ocupar el espacio libre constantemente, no agruparse alrededor del balón.", "Definir rápido ante porterías pequeñas."],
        commonMistakes: ["Todo el grupo se aglomera cerca del balón.", "Falta de amplitud para recibir en espacios libres."],
        variants: ["Agregar comodín neutral para favorecer la posesión.", "Cambiar a 3v3 para aumentar aún más los contactos por jugador."],
      },
      {
        name: "Partido reducido 6v6 con reglas condicionadas",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description: "Partido reducido con condición de dos toques máximo, favoreciendo la circulación rápida y la lectura anticipada del juego.",
        organization: "Espacio de 30x20 m con porterías reglamentarias reducidas, arquero opcional.",
        objective: "Integrar en un contexto competitivo real los principios técnico-tácticos trabajados en la sesión.",
        coachCorrections: ["Anticipar la jugada antes de recibir para cumplir el límite de toques.", "Comunicación constante para facilitar la circulación rápida."],
        commonMistakes: ["Perder el balón por intentar más toques de los permitidos.", "Poca comunicación verbal entre compañeros."],
        variants: ["Liberar el número de toques en los últimos minutos.", "Sumar puntos extra por goles de primera intención."],
      },
    ],
    appliedMatch: {
      organization: "Partido reducido final 6v6 o 7v7 sin condiciones, a máxima intensidad competitiva.",
      rules: "Juego libre — el marcador y la competitividad son parte intencional del cierre de la sesión.",
      objective: "Cerrar la sesión con una situación de juego real, competitiva y motivante.",
    },
    indicators: ["Toma de decisiones", "Comunicación", "Intensidad", "Trabajo en equipo"],
  },

  Porteros: {
    warmupFocus: "activación específica de arqueros: desplazamientos laterales, caídas controladas y manejo de balón con las manos.",
    exercises: [
      {
        name: "Técnica de base: posición y desplazamientos",
        requiredMaterials: ["Balones"],
        baseDurationShare: 0.3,
        description: "Trabajo de posición base, desplazamientos laterales y recepción de balones rasos y a media altura.",
        organization: "Arqueros en portería, entrenador o compañero lanzando balones desde distintos ángulos.",
        objective: "Consolidar los fundamentos técnicos de la posición de arquero.",
        coachCorrections: ["Posición base con rodillas ligeramente flexionadas y peso en el metatarso.", "Manos activas y adelantadas antes de la recepción."],
        commonMistakes: ["Cruzar las piernas al desplazarse lateralmente.", "Recepción con el cuerpo erguido, sin flexión de rodillas."],
        variants: ["Aumentar la velocidad de los lanzamientos progresivamente.", "Incluir recepción tras un desplazamiento más amplio."],
      },
      {
        name: "Reflejos y paradas cercanas",
        requiredMaterials: ["Balones", "Porterías"],
        baseDurationShare: 0.35,
        description: "Series de remates cercanos y progresivos para trabajar el tiempo de reacción y la técnica de parada.",
        organization: "Arquero en portería, dos o tres jugadores rematando por turnos desde distancia corta.",
        objective: "Mejorar el tiempo de reacción y la seguridad en la parada a corta distancia.",
        coachCorrections: ["Caída controlada, protegiendo el rebote hacia zonas seguras.", "Ojos abiertos y fijos en el balón durante todo el recorrido."],
        commonMistakes: ["Cerrar los ojos en el momento del impacto.", "Rechazar el balón hacia el centro del área en vez de hacia afuera."],
        variants: ["Incluir rebotes que exijan una segunda acción inmediata.", "Trabajar paradas altas si el nivel del grupo lo permite."],
      },
      {
        name: "1v1 y salidas ante centros",
        requiredMaterials: ["Balones", "Porterías", "Conos"],
        baseDurationShare: 0.35,
        description: "Situaciones de mano a mano frente a un delantero y salidas para despejar o atrapar centros laterales.",
        organization: "Arquero en portería, un atacante en situación de 1v1 y un centrador lateral alternando ejercicios.",
        objective: "Desarrollar la toma de decisiones del arquero en situaciones de alta exigencia mental.",
        coachCorrections: ["Achicar el ángulo con decisión en el 1v1, sin anticiparse de más.", "Comunicación clara y temprana antes de salir a un centro."],
        commonMistakes: ["Salir tarde o con dudas en el 1v1.", "No comunicar la salida, generando choques con defensores."],
        variants: ["Agregar un defensor de apoyo en el 1v1.", "Variar la altura y velocidad de los centros."],
      },
    ],
    appliedMatch: {
      organization: "Situaciones de finalización 3v2 o 4v3 con arquero real, rotando arqueros cada 10 minutos.",
      rules: "Cada intervención decisiva del arquero se destaca y se analiza brevemente con el grupo.",
      objective: "Transferir el trabajo específico a situaciones reales de partido con exigencia de decisión.",
    },
    indicators: ["Toma de decisiones", "Comunicación", "Liderazgo", "Intensidad"],
  },

  Resistencia: {
    warmupFocus: "activación progresiva con trote continuo y aumento gradual del ritmo cardíaco.",
    exercises: [
      {
        name: "Fartlek técnico con balón",
        requiredMaterials: ["Balones", "Conos"],
        baseDurationShare: 0.3,
        description: "Carrera continua con cambios de ritmo cada 2-3 minutos, alternando conducción de balón en los tramos de menor intensidad.",
        organization: "Circuito continuo delimitado con conos, grupo completo en desplazamiento constante.",
        objective: "Desarrollar la resistencia aeróbica de base manteniendo contacto técnico con el balón.",
        coachCorrections: ["Respiración controlada durante los tramos de mayor ritmo.", "No perder la técnica de conducción por la fatiga acumulada."],
        commonMistakes: ["Ritmo parejo sin respetar los cambios indicados.", "Abandonar el balón en los tramos de mayor exigencia."],
        variants: ["Aumentar la duración de los tramos intensos progresivamente.", "Sin balón para jugadores que necesiten foco puramente físico."],
      },
      {
        name: "Circuito intermitente por estaciones",
        requiredMaterials: ["Balones", "Conos", "Cronómetro"],
        baseDurationShare: 0.35,
        description: "Estaciones técnicas con formato 30 segundos de trabajo por 30 de pausa activa, repetido en 4-5 estaciones.",
        organization: "Estaciones distribuidas en el espacio, grupos rotando cada intervalo marcado por cronómetro.",
        objective: "Combinar la exigencia física intermitente propia del fútbol con tareas técnicas simples.",
        coachCorrections: ["Mantener la calidad técnica incluso en los últimos intervalos.", "Aprovechar completamente la pausa activa para recuperar."],
        commonMistakes: ["Bajar demasiado la intensidad en los primeros intervalos por falta de gestión del esfuerzo.", "No respetar el tiempo de pausa."],
        variants: ["Aumentar a 40/20 para mayor exigencia en categorías más avanzadas.", "Reducir a 20/40 si el grupo muestra fatiga acumulada."],
      },
      {
        name: "Partido de alta duración con exigencia progresiva",
        requiredMaterials: ["Balones", "Petos", "Porterías"],
        baseDurationShare: 0.35,
        description: "Partido de duración extendida con aumento progresivo del tamaño del espacio de juego cada 8-10 minutos.",
        organization: "Espacio inicial reducido que se amplía progresivamente, equipos fijos durante todo el bloque.",
        objective: "Exigir resistencia específica en un contexto de juego real y prolongado.",
        coachCorrections: ["Gestionar el esfuerzo pensando en la duración total del bloque.", "Mantener la intensidad de presión incluso en los últimos minutos."],
        commonMistakes: ["Salir a un ritmo demasiado alto que no se puede sostener.", "Bajar la intensidad de presión en la última parte por fatiga."],
        variants: ["Incluir pausas breves de hidratación cada 10 minutos.", "Reducir la duración si es la primera semana de este tipo de trabajo."],
      },
    ],
    appliedMatch: {
      organization: "Partido 8v8 en cancha amplia con duración extendida.",
      rules: "Se destaca especialmente a los jugadores que mantienen la intensidad hasta el final del bloque.",
      objective: "Consolidar la resistencia física específica en condiciones reales de partido.",
    },
    indicators: ["Resistencia", "Intensidad", "Disciplina"],
  },

  Coordinación: {
    warmupFocus: "activación con desplazamientos coordinativos variados (laterales, cruzados, con giros).",
    exercises: [
      {
        name: "Circuito de escalera de agilidad y aros",
        requiredMaterials: ["Escaleras de agilidad", "Aros"],
        baseDurationShare: 0.3,
        description: "Circuito combinando patrones de escalera de agilidad (apoyos simples, dobles, cruzados) con saltos coordinados entre aros.",
        organization: "Estaciones paralelas de escalera y aros, rotación individual con recuperación breve entre pasadas.",
        objective: "Desarrollar la coordinación óculo-pédica y la capacidad de reacción motriz.",
        coachCorrections: ["Apoyos precisos dentro de cada espacio, sin pisar los bordes.", "Postura erguida y brazos activos durante el desplazamiento."],
        commonMistakes: ["Priorizar la velocidad sobre la precisión de los apoyos.", "Mirar los pies en vez del frente durante el ejercicio."],
        variants: ["Agregar balón en la salida del circuito.", "Combinar patrones más complejos para jugadores avanzados."],
      },
      {
        name: "Coordinación con balón (malabares y cambios de superficie)",
        requiredMaterials: ["Balones"],
        baseDurationShare: 0.35,
        description: "Ejercicios individuales de toques con distintas superficies del pie, muslo y cabeza, en secuencias progresivas.",
        organization: "Cada jugador con un balón, espacio individual amplio, progresión de dificultad cada 2 minutos.",
        objective: "Mejorar la relación del jugador con el balón y su coordinación general.",
        coachCorrections: ["Contacto suave y controlado, no forzar la altura del balón.", "Alternar ambos perfiles durante la secuencia."],
        commonMistakes: ["Frustración visible ante la dificultad (gestionar el error como parte del aprendizaje).", "Ejecutar siempre con el mismo perfil dominante."],
        variants: ["Trabajar en parejas con pase y control coordinado.", "Cronometrar series para agregar un componente de desafío personal."],
      },
      {
        name: "Circuito combinado de coordinación y finalización",
        requiredMaterials: ["Escaleras de agilidad", "Balones", "Porterías"],
        baseDurationShare: 0.35,
        description: "El jugador atraviesa un circuito coordinativo y finaliza la secuencia con un remate a portería.",
        organization: "Circuito individual que termina frente al arco, rotación tras cada remate.",
        objective: "Transferir la coordinación de base a una acción técnica de cierre con exigencia mental.",
        coachCorrections: ["Mantener el control del balón mientras se ejecuta el patrón coordinativo.", "Recuperar el equilibrio antes de definir."],
        commonMistakes: ["Perder el control del balón durante el circuito por exceso de velocidad.", "Definir apresuradamente sin recuperar el equilibrio."],
        variants: ["Agregar un defensor pasivo en la última fase.", "Cambiar el remate por un pase a un compañero."],
      },
    ],
    appliedMatch: {
      organization: "Partido reducido 5v5 con espacio irregular (usando conos como obstáculos leves).",
      rules: "Se valora la capacidad de adaptación del jugador a un entorno de juego no estándar.",
      objective: "Aplicar la coordinación desarrollada en un contexto dinámico y variable.",
    },
    indicators: ["Coordinación", "Control", "Actitud ante el error"],
  },
};
