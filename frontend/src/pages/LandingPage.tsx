import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Play, ChevronDown, Users, TrendingUp, Clock, AlertCircle,
  Monitor, Layers, Search, BarChart2, Target, FileText, Github,
  ExternalLink, Mail, GraduationCap, Calendar, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─────────────────────────────────────────────────────────────────────────────
   Hook: activa la clase "visible" cuando el elemento entra en el viewport.
   Equivalente al IntersectionObserver del archivo HTML original.
───────────────────────────────────────────────────────────────────────────── */
function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("fi-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".fi").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Componentes internos reutilizables
───────────────────────────────────────────────────────────────────────────── */

/** Etiqueta pequeña de sección (eyebrow) */
const Tag = ({ children }: { children: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
               text-primary bg-primary-light px-3 py-1.5 rounded-full mb-4"
  >
    {children}
  </span>
);

/** Tarjeta base con hover */
const Card = ({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`bg-white border border-border rounded-xl shadow-card
                transition-all duration-300 hover:-translate-y-0.5 hover:shadow-medical ${className}`}
    style={style}
  >
    {children}
  </div>
);

/** Contenedor de sección con ancho máximo */
const Section = ({
  children,
  id,
  className = "",
  style,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <section id={id} className={`py-20 ${className}`} style={style}>
    <div className="max-w-6xl mx-auto px-6">{children}</div>
  </section>
);

/** Encabezado centrado de sección */
const SectionHeader = ({
  tag,
  title,
  desc,
}: {
  tag: string;
  title: React.ReactNode;
  desc: string;
}) => (
  <div className="text-center max-w-2xl mx-auto mb-14 fi">
    <Tag>{tag}</Tag>
    <h2
      className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4"
      style={{ color: "hsl(var(--foreground))" }}
    >
      {title}
    </h2>
    <p className="text-muted-foreground text-lg leading-relaxed">{desc}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   PÁGINA PRINCIPAL
───────────────────────────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  useFadeIn();

  /* Estilos que no puede manejar Tailwind directamente (gradientes custom, etc.) */
  const S = {
    heroBg: {
      background:
        "linear-gradient(160deg, hsl(332,30%,8%) 0%, hsl(332,45%,18%) 60%, hsl(320,50%,22%) 100%)",
    } as React.CSSProperties,
    gradientText: {
      background: "linear-gradient(135deg, hsl(332,75%,51%) 0%, hsl(320,70%,60%) 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    } as React.CSSProperties,
    gradientBtn: {
      background: "linear-gradient(135deg, hsl(332,75%,51%) 0%, hsl(320,70%,60%) 100%)",
      boxShadow: "0 4px 24px -4px hsl(332 75% 51% / 0.35)",
    } as React.CSSProperties,
    academiaCard: {
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.14)",
      backdropFilter: "blur(8px)",
    } as React.CSSProperties,
    moduloResult: {
      background: "hsl(var(--primary-light))",
      borderLeft: "3px solid hsl(var(--primary))",
    } as React.CSSProperties,
    softBg: {
      background: "linear-gradient(180deg, hsl(0,0%,100%) 0%, hsl(332,100%,98%) 100%)",
    } as React.CSSProperties,
    darkBg: {
      background:
        "linear-gradient(160deg, hsl(332,30%,8%) 0%, hsl(332,45%,18%) 60%, hsl(320,50%,22%) 100%)",
    } as React.CSSProperties,
  };

  return (
    <>
      {/* Estilos para la animación fade-in y el punto pulsante */}
      <style>{`
        .fi {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fi.fi-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fi:nth-child(2) { transition-delay: 0.08s; }
        .fi:nth-child(3) { transition-delay: 0.16s; }
        .fi:nth-child(4) { transition-delay: 0.24s; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .pulse-dot { animation: pulse-dot 2s infinite; }
      `}</style>

      {/* ──────────────────────────────────────────────────────────────────
          NAV — fija, glassmorphism
      ────────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-border"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(14px)" }}
        aria-label="Navegación principal"
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-medical"
              style={S.gradientBtn}
              aria-hidden="true"
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span style={{ color: "hsl(var(--foreground))" }}>VARIME</span>
          </a>

          {/* Links desktop */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            {[
              ["#problema",    "El problema"],
              ["#que-es",      "Qué es"],
              ["#modulos",     "Cómo funciona"],
              ["#metodologia", "Metodología"],
              ["#academia",    "Proyecto"],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm font-medium text-muted-foreground px-3.5 py-2 rounded-lg
                             hover:text-primary hover:bg-primary-light transition-all"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            className="hidden md:inline-flex text-white shadow-medical hover:opacity-90"
            style={S.gradientBtn}
            onClick={() => navigate("/login")}
          >
            Iniciar sesión
          </Button>
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 1 — HERO
      ────────────────────────────────────────────────────────────────── */}
      <section
        id="inicio"
        className="min-h-screen flex items-center pt-28 pb-20 relative overflow-hidden"
        style={S.heroBg}
        aria-labelledby="hero-title"
      >
        {/* Orbes decorativos de fondo */}
        <div
          aria-hidden="true"
          className="absolute top-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(332,75%,51%,0.15) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-10%] left-[-8%] w-[35vw] h-[35vw] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(320,70%,60%,0.12) 0%, transparent 70%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          {/* Badge contextual */}
          <div className="fi fi-visible inline-flex items-center gap-2 text-xs font-medium text-white/80 mb-6
                          px-3.5 py-1.5 rounded-full"
               style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <span className="pulse-dot w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
            Proyecto de tesis — Universidad de San Buenaventura, Cali
          </div>

          {/* Titular principal */}
          <h1
            id="hero-title"
            className="fi fi-visible text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white max-w-3xl mb-6"
          >
            El cáncer de cuello uterino mata a miles de mujeres colombianas cada año.{" "}
            <span style={S.gradientText}>VARIME ayuda a detectarlo antes.</span>
          </h1>

          {/* Subtítulo */}
          <p
            className="fi fi-visible text-lg text-white/70 max-w-xl leading-relaxed mb-10"
            style={{ transitionDelay: "0.1s" }}
          >
            Un sistema de inteligencia artificial que asiste a profesionales de salud en el
            diagnóstico temprano mediante análisis de citología e imágenes de resonancia magnética
            con modelos Vision Transformer.
          </p>

          {/* CTAs */}
          <div className="fi fi-visible flex flex-wrap gap-3" style={{ transitionDelay: "0.2s" }}>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm
                         transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={S.gradientBtn}
              onClick={() => document.getElementById("modulos")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play className="w-4 h-4" fill="white" />
              Ver cómo funciona
            </button>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white/90 text-sm
                         transition-all hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)" }}
              onClick={() => navigate("/login")}
            >
              Acceder al sistema
            </button>
          </div>

          {/* Estadísticas flotantes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
            {[
              {
                value: "~4 200*",
                label: "casos nuevos por año en Colombia",
                note: "[Fuente: INC — placeholder]",
              },
              {
                value: "2.°",
                label: "cáncer más frecuente en mujeres colombianas",
                note: "[Fuente: Globocan / OPS — placeholder]",
              },
              {
                value: "90 %*",
                label: "de muertes son evitables con detección temprana",
                note: "[Fuente: OMS — placeholder]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="fi fi-visible rounded-xl p-5"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="text-3xl font-extrabold text-white leading-none mb-1">{stat.value}</div>
                <div className="text-sm text-white/60 mb-1">{stat.label}</div>
                <div className="text-xs text-white/35">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 2 — EL PROBLEMA
      ────────────────────────────────────────────────────────────────── */}
      <Section id="problema">
        <SectionHeader
          tag="El problema"
          title="El diagnóstico tardío cuesta vidas en Colombia"
          desc="El cáncer de cuello uterino es prevenible. Sin embargo, brechas en acceso, infraestructura
                y personal especializado hacen que muchos casos se detecten cuando el tratamiento ya es limitado."
        />

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Texto contextual */}
          <div className="fi space-y-4 text-muted-foreground leading-relaxed">
            <p>
              En el <strong className="text-foreground">Valle del Cauca</strong>, la incidencia de cáncer
              cervical supera el promedio nacional. Las mujeres en zonas rurales y municipios alejados de
              Cali enfrentan demoras de semanas —o meses— para obtener una lectura de citología por parte
              de un citopatólogo calificado.
            </p>
            <p>
              Colombia cuenta con un sistema de tamizaje basado en el{" "}
              <strong className="text-foreground">frotis de Papanicolaou</strong>, pero la{" "}
              <strong className="text-foreground">escasez de especialistas</strong>, la falta de equipos
              de resonancia en centros de atención primaria y los tiempos prolongados generan cuellos de
              botella que retrasan el diagnóstico.
            </p>
            <p>
              Detectar una lesión precancerosa en estadio temprano puede significar la diferencia entre un
              tratamiento ambulatorio sencillo y una intervención oncológica mayor.{" "}
              <strong className="text-foreground">El tiempo importa.</strong>
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border">
              * Cifras de referencia con fines académicos. Contrastar con publicaciones recientes del INC,
              Globocan y la OPS.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Users,      value: "~4 200*", label: "casos nuevos / año en Colombia",         note: "[INC — placeholder]" },
              { icon: TrendingUp, value: "Alta*",   label: "incidencia en el Valle del Cauca",       note: "[Globocan / OPS — placeholder]" },
              { icon: Clock,      value: "Semanas*",label: "espera para lectura citológica",          note: "[Literatura — placeholder]" },
              { icon: AlertCircle,value: "90 %*",   label: "de muertes son prevenibles con tamizaje",note: "[OMS — placeholder]" },
            ].map((s) => (
              <Card key={s.label} className="fi p-5 flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-primary leading-none mb-0.5">{s.value}</div>
                  <div className="text-sm font-medium text-foreground mb-0.5">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.note}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 3 — QUÉ ES VARIME
      ────────────────────────────────────────────────────────────────── */}
      <Section id="que-es" style={S.softBg}>
        <SectionHeader
          tag="Qué es VARIME"
          title="Una herramienta de apoyo al diagnóstico, no una caja negra"
          desc="VARIME es un sistema de aprendizaje profundo que analiza imágenes médicas cervicales
                y entrega un resultado estructurado al profesional de salud, que siempre tiene la última palabra."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Monitor,
              title: "Análisis automatizado",
              desc: "Procesa imágenes de citología y resonancia magnética en segundos, reduciendo tiempos de espera de semanas a minutos para el primer resultado orientativo.",
            },
            {
              icon: Brain,
              title: "Dos modelos especializados",
              desc: "Un módulo para citología cervical y otro para análisis de heterogeneidad tumoral por MRI, entrenados sobre datasets clínicos reales y validados.",
            },
            {
              icon: FileText,
              title: "Informe estructurado",
              desc: "Cada análisis produce un nivel de riesgo, un índice de confianza y recomendaciones clínicas que el médico puede revisar y adjuntar al expediente.",
            },
          ].map((f) => (
            <Card key={f.title} className="fi p-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-medical"
                style={S.gradientBtn}
                aria-hidden="true"
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 4 — CÓMO FUNCIONA: DOS MÓDULOS
      ────────────────────────────────────────────────────────────────── */}
      <Section id="modulos">
        <SectionHeader
          tag="Cómo funciona"
          title="Dos módulos complementarios para una visión completa"
          desc="VARIME combina dos fuentes de información distintas —la célula individual y el tumor como unidad—
                para ofrecer una evaluación más robusta al profesional."
        />

        <div className="grid md:grid-cols-2 gap-8">
          {/* ── MÓDULO 1 ── */}
          <Card className="fi overflow-hidden">
            <div className="p-7 border-b border-border">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold mb-4"
                style={S.gradientBtn}
                aria-label="Módulo 1"
              >
                1
              </span>
              <h3 className="text-xl font-bold tracking-tight mb-1">Clasificación citológica</h3>
              <p className="text-sm text-muted-foreground font-medium">Análisis de células cervicales individuales</p>
            </div>
            <div className="p-7 space-y-5">
              {[
                {
                  icon: ChevronDown,
                  label: "Entrada",
                  text: "Imagen de frotis de Papanicolaou (PNG / BMP). La toma se realiza con el procedimiento estándar de citología convencional.",
                },
                {
                  icon: Search,
                  label: "Análisis",
                  text: "El modelo Vision Transformer (ViT) divide la imagen en parches y clasifica la muestra en cinco categorías clínicas, desde células normales hasta displasia severa. La IA mira cada célula como lo haría un especialista, pero en segundos.",
                },
                {
                  icon: BarChart2,
                  label: "¿Por qué importa?",
                  text: "Detectar displasia leve o moderada es la ventana de oportunidad para tratamientos no invasivos. Una clasificación rápida permite priorizar los casos que requieren confirmación urgente.",
                },
              ].map((step) => (
                <div key={step.label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-0.5">
                      {step.label}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}

              {/* Resultado */}
              <div className="rounded-lg p-4 mt-2" style={S.moduloResult}>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-1.5">
                  Resultado entregado
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Categoría celular (normal / metaplasia / displasia leve / moderada / severa)
                  con nivel de confianza y zonas de interés destacadas.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold
                              bg-accent text-accent-foreground px-2.5 py-1 rounded-full">
                Dataset: SIPaKMeD (5 clases celulares)
              </div>
            </div>
          </Card>

          {/* ── MÓDULO 2 ── */}
          <Card className="fi overflow-hidden">
            <div className="p-7 border-b border-border">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold mb-4"
                style={S.gradientBtn}
                aria-label="Módulo 2"
              >
                2
              </span>
              <h3 className="text-xl font-bold tracking-tight mb-1">Heterogeneidad tumoral por MRI</h3>
              <p className="text-sm text-muted-foreground font-medium">Análisis de variabilidad interna del tumor</p>
            </div>
            <div className="p-7 space-y-5">
              {[
                {
                  icon: Monitor,
                  label: "Entrada",
                  text: "Imagen de resonancia magnética pélvica (MRI). No requiere contraste adicional sobre el estudio estándar.",
                },
                {
                  icon: Layers,
                  label: "Análisis",
                  text: "Un segundo modelo ViT evalúa la heterogeneidad intra-tumoral: qué tan uniforme o variable es la composición celular dentro del tumor. Conocer esta variabilidad ayuda a planear mejor el tratamiento.",
                },
                {
                  icon: Target,
                  label: "¿Por qué importa?",
                  text: "Tumores con alta heterogeneidad responden diferente a quimioterapia y radioterapia. Cuantificar este parámetro desde el inicio guía al oncólogo en la selección del protocolo más adecuado.",
                },
              ].map((step) => (
                <div key={step.label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-0.5">
                      {step.label}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}

              {/* Resultado */}
              <div className="rounded-lg p-4 mt-2" style={S.moduloResult}>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest text-primary mb-1.5">
                  Resultado entregado
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  Clasificación de heterogeneidad (baja / media / alta) con índice de confianza,
                  regiones de interés y recomendaciones clínicas orientativas.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold
                              bg-accent text-accent-foreground px-2.5 py-1 rounded-full">
                Dataset: TCIA CC-Tumor-Heterogeneity (MRI cervical)
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 5 — POR QUÉ VISION TRANSFORMERS
      ────────────────────────────────────────────────────────────────── */}
      <Section style={S.softBg}>
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Texto */}
          <div className="fi">
            <Tag>Arquitectura</Tag>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
              Por qué Vision Transformers
            </h2>
            <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: "linear-gradient(135deg, hsl(332,75%,51%) 0%, hsl(320,70%,60%) 100%)" }} />
            <p className="text-muted-foreground leading-relaxed mb-4">
              Las redes convolucionales (CNN) analizan la imagen fragmento por fragmento, integrando
              gradualmente los patrones locales. Son poderosas, pero limitadas para capturar relaciones
              entre regiones distantes.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Los <strong className="text-foreground">Vision Transformers (ViT)</strong> aplican el
              mecanismo de atención a imágenes médicas. Dividen la imagen en parches y calculan
              simultáneamente cómo se relaciona cada parche con todos los demás.{" "}
              <strong className="text-foreground">Ven la imagen como un todo desde el primer momento.</strong>
            </p>
            <ul className="space-y-3">
              {[
                "Captura relaciones globales y locales en paralelo",
                "Mayor robustez ante variaciones de tinción y calidad",
                "Atención interpretable: se puede visualizar qué zonas analizó el modelo",
                "Escalable a imágenes de alta resolución diagnóstica",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, hsl(332,75%,51%), hsl(320,70%,60%))" }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Comparación visual */}
          <div className="fi space-y-4">
            {/* CNN */}
            <Card className="p-5 flex gap-4 items-start">
              <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(215,25%,40%)"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">CNN tradicional</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lee la imagen bloque por bloque. Integra gradualmente la información local.
                  Puede perder relaciones de largo alcance relevantes para el diagnóstico.
                </p>
              </div>
            </Card>

            {/* ViT */}
            <Card className="p-5 flex gap-4 items-start border-primary/20">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 shadow-medical"
                style={S.gradientBtn}
                aria-hidden="true"
              >
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">Vision Transformer (ViT)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ve la imagen como un mapa completo desde el primer momento y decide qué zonas merecen
                  más atención. Captura contexto global desde la primera capa.
                </p>
              </div>
            </Card>

            {/* Analogía */}
            <div className="rounded-xl p-5 bg-primary-light border border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Analogía:</strong> mientras una CNN descubre una ciudad bloque por bloque,
                el ViT la ve como un mapa completo y decide qué zonas merecen más atención.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 6 — METODOLOGÍA
      ────────────────────────────────────────────────────────────────── */}
      <Section id="metodologia">
        <SectionHeader
          tag="Rigor académico e ingenieril"
          title="Un proyecto construido con metodología"
          desc="VARIME siguió marcos de trabajo establecidos en ingeniería de Machine Learning y
                arquitectura de software, garantizando trazabilidad, calidad y replicabilidad."
        />

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {[
            {
              tipo: "Proceso ML",
              nombre: "CRISP-ML(Q)",
              desc: "Cross-Industry Standard Process for Machine Learning with Quality Assurance. Organiza el ciclo de vida del modelo en fases iterativas con criterios de calidad explícitos en cada etapa. Garantiza que el sistema haya sido validado antes de usarse en contexto médico.",
              pasos: ["Comprensión del negocio", "Preparación de datos", "Modelado", "Evaluación", "Despliegue", "Monitoreo"],
            },
            {
              tipo: "Arquitectura de software",
              nombre: "Modelo de Vistas 4+1",
              desc: "El diseño arquitectónico fue documentado usando el Modelo de Vistas 4+1 de Kruchten: frontend, backend, base de datos, modelos de IA y despliegue en contenedores. Cada vista asegura que cualquier stakeholder comprenda el sistema desde su perspectiva.",
              pasos: ["Vista lógica", "Vista de proceso", "Vista de desarrollo", "Vista física", "Escenarios (+1)"],
            },
          ].map((m) => (
            <Card key={m.nombre} className="fi p-8">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-primary
                               bg-primary-light px-2.5 py-1 rounded-full">
                {m.tipo}
              </span>
              <h3 className="text-xl font-bold tracking-tight mt-4 mb-3">{m.nombre}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{m.desc}</p>
              <div className="flex flex-wrap gap-2">
                {m.pasos.map((p) => (
                  <span key={p} className="text-xs font-medium bg-secondary text-secondary-foreground
                                           px-3 py-1 rounded-full border border-border">
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Stack tecnológico */}
        <div className="fi">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Stack tecnológico
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Python / FastAPI", "TensorFlow / Keras", "Vision Transformer (ViT)",
              "React + TypeScript", "PostgreSQL", "Docker Compose",
              "SIPaKMeD Dataset", "TCIA CC-Tumor-Heterogeneity",
            ].map((t) => (
              <span key={t} className="text-sm font-semibold text-primary bg-primary-light
                                        px-3.5 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 7 — CONTEXTO ACADÉMICO
      ────────────────────────────────────────────────────────────────── */}
      <section
        id="academia"
        className="py-20 relative overflow-hidden"
        style={S.darkBg}
        aria-labelledby="academia-title"
      >
        {/* Orbe decorativo */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-[40vw] h-[40vw] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 30%, hsl(332,75%,51%,0.12) 0%, transparent 60%)" }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 fi">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
                             text-white/70 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              Contexto académico
            </span>
            <h2 id="academia-title" className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              Un proyecto de investigación aplicada
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              VARIME nació en la Facultad de Ingeniería como respuesta a una necesidad
              real del sistema de salud colombiano.
            </p>
          </div>

          {/* Tarjeta destacada — Autora */}
          <div className="fi mb-6">
            <div
              className="rounded-2xl p-7 flex flex-col sm:flex-row items-center sm:items-start gap-6"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(67,56,202,0.2) 100%)",
                border: "1px solid rgba(167,139,250,0.35)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Avatar inicial */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl font-extrabold text-white shadow-medical"
                style={S.gradientBtn}
                aria-hidden="true"
              >
                VR
              </div>
              <div className="text-center sm:text-left">
                <div
                  className="text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                  style={{ color: "hsl(332,80%,72%)" }}
                >
                  Autora — Trabajo de Grado
                </div>
                <div className="text-xl font-extrabold text-white mb-1">Valeria Rudas Ruiz</div>
                <div className="text-sm text-white/60">
                  Estudiante de Ingeniería de Sistemas · Universidad de San Buenaventura, Cali
                </div>
                <div className="mt-3 text-sm text-white/50 leading-relaxed max-w-xl">
                  Este proyecto es el resultado de su trabajo de grado, enfocado en el desarrollo
                  de un sistema de inteligencia artificial para el apoyo al diagnóstico temprano
                  del cáncer de cuello uterino en el contexto del sistema de salud colombiano.
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: GraduationCap,
                label: "Institución",
                value: "Universidad de San Buenaventura, Cali",
                sub: "Facultad de Ingeniería — Ingeniería de Sistemas",
              },
              {
                icon: UserCheck,
                label: "Director de tesis",
                value: "Carlos Giovanny Hidalgo Suárez, PhD",
                sub: "Docente investigador",
              },
              {
                icon: Calendar,
                label: "Año",
                value: "2025",
                sub: "Tesis de pregrado en curso",
              },
            ].map((c) => (
              <div key={c.label} className="fi rounded-2xl p-7" style={S.academiaCard}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-medical"
                  style={S.gradientBtn}
                  aria-hidden="true"
                >
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                     style={{ color: "hsl(332,80%,72%)" }}>
                  {c.label}
                </div>
                <div className="font-semibold text-white leading-snug mb-1">{c.value}</div>
                <div className="text-sm text-white/55">{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Logo placeholder USB */}
          <div className="fi inline-flex items-center gap-3 rounded-2xl px-5 py-3.5"
               style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)" }}
               role="img" aria-label="Logo Universidad de San Buenaventura Cali — placeholder">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Universidad de San Buenaventura</div>
              <div className="text-xs text-white/50">Cali, Colombia — Logo institucional (placeholder)</div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECCIÓN 8 — FOOTER
      ────────────────────────────────────────────────────────────────── */}
      <footer
        className="py-12"
        style={{ background: "hsl(332,18%,12%)", color: "rgba(255,255,255,0.8)" }}
        role="contentinfo"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-white/10 mb-8">
            {/* Col 1: logo + disclaimer */}
            <div>
              <div className="flex items-center gap-2.5 font-extrabold text-lg text-white mb-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={S.gradientBtn}
                  aria-hidden="true"
                >
                  <Brain className="w-4 h-4 text-white" />
                </div>
                VARIME
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                Sistema de inteligencia artificial para detección temprana de cáncer cervical.
                Desarrollo académico — Universidad de San Buenaventura, Cali.
              </p>
              {/* Aviso de uso responsable */}
              <div
                className="text-xs text-white/45 p-3.5 leading-relaxed rounded-r-xl"
                style={{ background: "rgba(255,255,255,0.05)", borderLeft: "3px solid hsl(332,60%,55%)" }}
                role="note"
              >
                <strong style={{ color: "rgba(255,255,255,0.65)" }}>Uso responsable:</strong>{" "}
                VARIME es una herramienta de apoyo al diagnóstico. No reemplaza el criterio clínico
                del profesional de salud ni constituye por sí sola un diagnóstico médico definitivo.
              </div>
            </div>

            {/* Col 2: links del proyecto */}
            <div>
              <h3 className="text-[0.65rem] font-bold uppercase tracking-widest mb-4"
                  style={{ color: "hsl(332,60%,65%)" }}>
                Proyecto
              </h3>
              <ul className="space-y-2.5 list-none">
                {[
                  { icon: Github,   label: "Repositorio GitHub",  note: "(próximamente)", href: "#" },
                  { icon: FileText, label: "Documento de tesis",  note: "(próximamente)", href: "#" },
                  { icon: Mail,     label: "Contacto",            note: "",               href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href}
                       className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                      <l.icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {l.label}
                      {l.note && <span className="text-xs text-white/30">{l.note}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: referencias */}
            <div>
              <h3 className="text-[0.65rem] font-bold uppercase tracking-widest mb-4"
                  style={{ color: "hsl(332,60%,65%)" }}>
                Referencias
              </h3>
              <ul className="space-y-2.5 list-none">
                {[
                  { label: "INC Colombia",       href: "https://www.cancer.gov.co" },
                  { label: "Globocan / IARC",    href: "https://gco.iarc.fr" },
                  { label: "OMS — Cáncer cervical", href: "https://www.who.int/es/news-room/fact-sheets/detail/cervical-cancer" },
                  { label: "USB Cali",           href: "https://www.usbcali.edu.co" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2
                          text-xs text-white/30">
            <span>© 2025 VARIME — Universidad de San Buenaventura, Cali. Proyecto académico.</span>
            <span>Desarrollado para la salud pública colombiana</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
