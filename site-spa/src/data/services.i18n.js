// src/data/services.i18n.js
// ==== Imagens (mantidas iguais para todos os idiomas) ====
import torre from "../image/torre.jpg";
import torre2 from "../image/torre2.jpg";
import jato from "../image/jato.jpg";
import pintura from "../image/pintura.jpg";
import instala from "../image/instala.jpg";
import medicao from "../image/medicao.jpg";
import medir from "../image/medir.jpg";
import tele from "../image/tele.jpg";
import temetria from "../image/temetria.jpg";
import manutencao from "../image/manutencao.jpg";
import instalacao from "../image/instalacao.jpg";
import vento from "../image/vento4.jpg";
import preventiva from "../image/preventiva.jpeg";

// ===================================================================
// Estrutura:
// - Campos "comuns" (slug, área, imagens, tom do hero)
// - Traduções em i18n.{pt|en|es}: title, chip, summary, bullets, ctas, (extra opcional)
// ===================================================================
export const services = [
{
  slug: "torres-de-medicao",
  area: "fabricacao",
  cover: torre,
  hero: torre2,
  tone: {
    heroOverlay: "from-black/55 via-black/25 to-transparent",
    titleColor: "text-white",
  },
  i18n: {
    pt: {
      title: "Torres anemométricas / solarimétricas",
      chip: "Fabricação & Comissionamento",
      summary:
        "A IS fabrica torres estaiadas e autoportantes projetadas para medições anemométricas e solarimétricas, com verificação de projeto, inspeção dimensional e END. No comissionamento, checamos alinhamento, fixação dos sensores, aterramento e testes de leitura — garantindo dados confiáveis desde o início.",
      bullets: [
        "Verificação de projeto, corte/usinagem e inspeção dimensional.",
        "Ensaios não destrutivos (END) antes do envio ao campo.",
        "Comissionamento: alinhamento, fixação de sensores, aterramento e testes operacionais.",
        "Projeto orientado a reduzir vórtices e leituras enviesadas.",
      ],
      ctas: [
        { label: "Solicite informações técnicas", href: "/contato" }
      ],
    },
    en: {
      title: "Anemometric / solarimetric towers",
      chip: "Manufacturing & Commissioning",
      summary:
        "IS manufactures guyed and self-supporting towers designed for anemometric and solarimetric measurements, with design verification, dimensional inspection and NDT. During commissioning we check alignment, sensor mounting, grounding and reading tests—ensuring reliable data from day one.",
      bullets: [
        "Design verification, cutting/machining and dimensional inspection.",
        "Non-destructive testing (NDT) before field deployment.",
        "Commissioning: alignment, sensor mounting, grounding and operational tests.",
        "Design aimed at reducing vortices and biased readings.",
      ],
      ctas: [
        { label: "Request technical information", href: "/contato" },
        { label: "See commissioning checklist", href: "/docs/checklist-comissionamento.pdf" },
      ],
    },
    es: {
      title: "Torres anemométricas / solarimétricas",
      chip: "Fabricación y Puesta en Marcha",
      summary:
        "IS fabrica torres arriostradas y autoportantes diseñadas para mediciones anemométricas y solarimétricas, con verificación de diseño, inspección dimensional y END/PND. En la puesta en marcha verificamos alineación, fijación de sensores, puesta a tierra y pruebas de lectura—garantizando datos confiables desde el primer día.",
      bullets: [
        "Verificación de diseño, corte/mecanizado e inspección dimensional.",
        "Ensayos no destructivos (END/PND) antes del envío a campo.",
        "Puesta en marcha: alineación, fijación de sensores, puesta a tierra y pruebas operativas.",
        "Diseño orientado a reducir vórtices y lecturas sesgadas.",
      ],
      ctas: [
        { label: "Solicitar información técnica", href: "/contato" },
        { label: "Ver checklist de puesta en marcha", href: "/docs/checklist-comissionamento.pdf" },
      ],
    },
  },
},

  {
    slug: "pintura-industrial",
    area: "fabricacao",
    cover: pintura,
    hero: jato,
    tone: {
      heroOverlay: "from-black/55 via-black/25 to-transparent",
      titleColor: "text-white",
    },
    i18n: {
      pt: {
        title: "Pintura industrial (ISO 12944)",
        chip: "ISO 12944",
        summary:
          "Aplicamos sistemas de pintura conforme a ISO 12944, escolhendo o sistema adequado ao ambiente de exposição. Processo com preparação de superfície, camadas controladas e inspeções com espessômetro, com registros documentados.",
        bullets: [
          "Especificação conforme classe de corrosividade (C2–C5).",
          "Preparação de superfície e aplicação em etapas controladas.",
          "Medições de espessura (DFT) e registros fotográficos.",
          "END quando necessário para atestar integridade do revestimento.",
        ],
        ctas: [
          { label: "Solicite especificação de pintura", href: "/contato" },
          { label: "Peça avaliação de corrosão", href: "/contato" },
        ],
      },
      en: {
        title: "Industrial painting (ISO 12944)",
        chip: "ISO 12944",
        summary:
          "We apply coating systems in accordance with ISO 12944, selecting the appropriate system for the exposure environment. The process includes surface preparation, controlled layers, and inspections with DFT gauges and documented records.",
        bullets: [
          "Specification per corrosion category (C2–C5).",
          "Surface preparation and application in controlled stages.",
          "Dry film thickness (DFT) measurements and photographic records.",
          "NDT when required to attest coating integrity.",
        ],
        ctas: [
          { label: "Request paint specification", href: "/contato" },
          { label: "Ask for corrosion assessment", href: "/contato" },
        ],
        extra: { label: "Painting - blasting.zip", href: "/docs/pintura-jateamento.zip" },
      },
      es: {
        title: "Pintura industrial (ISO 12944)",
        chip: "ISO 12944",
        summary:
          "Aplicamos sistemas de recubrimiento según ISO 12944, seleccionando el sistema adecuado al ambiente de exposición. Proceso con preparación de superficie, capas controladas e inspecciones con medidor de espesor (DFT) y registros documentados.",
        bullets: [
          "Especificación según categoría de corrosividad (C2–C5).",
          "Preparación de superficie y aplicación en etapas controladas.",
          "Mediciones del espesor de película seca (DFT) y registros fotográficos.",
          "END/PND cuando corresponda para acreditar la integridad del recubrimiento.",
        ],
        ctas: [
          { label: "Solicitar especificación de pintura", href: "/contato" },
          { label: "Solicitar evaluación de corrosión", href: "/contato" },
        ],
        extra: { label: "Pintura - granallado.zip", href: "/docs/pintura-jateamento.zip" },
      },
    },
  },

  /* ===================== EQUIPAMENTOS ===================== */
  {
    slug: "sensores-e-calibracao",
    area: "equipamentos",
    cover: medir,
    hero: medir,
    tone: {
      heroOverlay: "from-black/60 via-black/30 to-transparent",
      titleColor: "text-white",
    },
    i18n: {
      pt: {
        title: "Equipamentos de medição (calibração Measnet)",
        chip: "Sensores & Dados",
        summary:
          "Fornecemos sensores e sistemas para medição meteorológica com opção de calibração Measnet. A calibração garante comparabilidade dos levantamentos e reduz a incerteza em estudos de viabilidade.",
        bullets: [
          "Sensores e data loggers com ou sem calibração Measnet.",
          "Comparabilidade entre campanhas e fornecedores.",
          "Redução de incertezas em estudos e decisões de investimento.",
        ],
        ctas: [
          { label: "Peça informações sobre calibração", href: "/contato" },
          { label: "Ver opções de sensores", href: "/contato" },
        ],
      },
      en: {
        title: "Measurement equipment (Measnet calibration)",
        chip: "Sensors & Data",
        summary:
          "We supply sensors and systems for meteorological measurement with optional Measnet calibration. Calibration ensures comparability across surveys and reduces uncertainty in feasibility studies.",
        bullets: [
          "Sensors and data loggers with or without Measnet calibration.",
          "Comparability between campaigns and suppliers.",
          "Reduced uncertainties in studies and investment decisions.",
        ],
        ctas: [
          { label: "Request information about calibration", href: "/contato" },
          { label: "See sensor options", href: "/contato" },
        ],
      },
      es: {
        title: "Equipos de medición (calibración Measnet)",
        chip: "Sensores y Datos",
        summary:
          "Suministramos sensores y sistemas para medición meteorológica con opción de calibración Measnet. La calibración asegura comparabilidad entre campañas y reduce la incertidumbre en estudios de viabilidad.",
        bullets: [
          "Sensores y data loggers con o sin calibración Measnet.",
          "Comparabilidad entre campañas y proveedores.",
          "Reducción de incertidumbres en estudios y decisiones de inversión.",
        ],
        ctas: [
          { label: "Solicitar información sobre calibración", href: "/contato" },
          { label: "Ver opciones de sensores", href: "/contato" },
        ],
      },
    },
  },

  /* ===================== INTEGRAÇÃO ===================== */
  {
    slug: "telemetria-e-integracao",
    area: "integracao",
    cover: temetria,
    hero: tele,
    tone: {
      heroOverlay: "from-black/60 via-black/30 to-transparent",
      titleColor: "text-white",
    },
    i18n: {
      pt: {
        title: "Telemetria e integração (SCADA, data loggers, comunicação)",
        chip: "SCADA • Loggers • Redes",
        summary:
          "Integramos instrumentação ao SCADA, programamos data loggers e configuramos soluções de comunicação (fibra/rádio/4G/satélite). Buscamos acesso remoto estável e monitoramento contínuo.",
        bullets: [
          "Integração ao SCADA e configuração de data loggers.",
          "Redes de comunicação adequadas ao projeto (fibra/rádio/4G/sat).",
          "Monitoramento contínuo e redução de perda de dados.",
        ],
        ctas: [
          { label: "Solicite integração técnica", href: "/contato" },
          { label: "Ver padrão de comunicação", href: "/contato" },
        ],
      },
      en: {
        title: "Telemetry & integration (SCADA, data loggers, communications)",
        chip: "SCADA • Loggers • Networks",
        summary:
          "We integrate instrumentation to SCADA, program data loggers and configure communications (fiber/radio/4G/satellite). We aim for stable remote access and continuous monitoring.",
        bullets: [
          "SCADA integration and data logger configuration.",
          "Communication networks suited to the project (fiber/radio/4G/sat).",
          "Continuous monitoring and reduced data loss.",
        ],
        ctas: [
          { label: "Request technical integration", href: "/contato" },
          { label: "See communications standard", href: "/contato" },
        ],
      },
      es: {
        title: "Telemetría e integración (SCADA, data loggers, comunicaciones)",
        chip: "SCADA • Loggers • Redes",
        summary:
          "Integramos instrumentación a SCADA, programamos data loggers y configuramos comunicaciones (fibra/radio/4G/satélite). Buscamos acceso remoto estable y monitoreo continuo.",
        bullets: [
          "Integración a SCADA y configuración de data loggers.",
          "Redes de comunicación adecuadas al proyecto (fibra/radio/4G/sat).",
          "Monitoreo continuo y reducción de pérdida de datos.",
        ],
        ctas: [
          { label: "Solicitar integración técnica", href: "/contato" },
          { label: "Ver estándar de comunicaciones", href: "/contato" },
        ],
      },
    },
  },

  /* ===================== CAMPO / O&M ===================== */
  {
    slug: "instalacao-e-instrumentacao",
    area: "campo",
    cover: instalacao,
    hero: manutencao,
    tone: {
      heroOverlay: "from-black/55 via-black/30 to-transparent",
      titleColor: "text-white",
    },
    i18n: {
      pt: {
        title: "Instalação e instrumentação em campo",
        chip: "Execução Segura",
        summary:
          "Equipes treinadas e procedimentos de segurança para instalação de torres, instrumentação e comissionamento, com checklists e documentação de conformidade.",
        bullets: [
          "Segurança em altura, plano de trabalho e equipe treinada.",
          "Instrumentação e comissionamento com checklists.",
          "Execução padronizada para dados confiáveis desde o dia 1.",
        ],
        ctas: [
          { label: "Agende visita técnica", href: "/contato" },
          { label: "Ver procedimentos de segurança", href: "/contato" },
        ],
      },
      en: {
        title: "Field installation & instrumentation",
        chip: "Safe Execution",
        summary:
          "Trained crews and safety procedures for tower installation, instrumentation and commissioning, with checklists and compliance documentation.",
        bullets: [
          "Work-at-height safety, work plan and trained crew.",
          "Instrumentation and commissioning with checklists.",
          "Standardized execution for reliable data from day one.",
        ],
        ctas: [
          { label: "Schedule a technical visit", href: "/contato" },
          { label: "See safety procedures", href: "/contato" },
        ],
      },
      es: {
        title: "Instalación e instrumentación en campo",
        chip: "Ejecución Segura",
        summary:
          "Equipos entrenados y procedimientos de seguridad para instalación de torres, instrumentación y puesta en marcha, con checklists y documentación de conformidad.",
        bullets: [
          "Seguridad en altura, plan de trabajo y equipo entrenado.",
          "Instrumentación y puesta en marcha con checklists.",
          "Ejecución estandarizada para datos confiables desde el día 1.",
        ],
        ctas: [
          { label: "Agendar visita técnica", href: "/contato" },
          { label: "Ver procedimientos de seguridad", href: "/contato" },
        ],
      },
    },
  },

  {
    slug: "manutencao-preventiva-corretiva",
    area: "campo",
    cover: preventiva,
    hero: vento,
    tone: {
      heroOverlay: "from-black/55 via-black/30 to-transparent",
      titleColor: "text-white",
    },
    i18n: {
      pt: {
        title: "Manutenção preventiva e corretiva",
        chip: "O&M",
        summary:
          "Manutenção preventiva e corretiva com diagnóstico de falhas, inspeção estrutural/elétrica e ações corretivas para minimizar downtime e preservar a qualidade dos dados.",
        bullets: [
          "Diagnóstico de falhas e inspeções estruturais/elétricas.",
          "Ações corretivas com foco em segurança e disponibilidade.",
          "Menor downtime e maior performance ao longo do tempo.",
        ],
        ctas: [
          { label: "Solicite plano de manutenção", href: "/contato" },
          { label: "Peça orçamento de intervenção", href: "/contato" },
        ],
      },
      en: {
        title: "Preventive & corrective maintenance",
        chip: "O&M",
        summary:
          "Preventive and corrective maintenance with fault diagnostics, structural/electrical inspection and corrective actions to minimize downtime and preserve data quality.",
        bullets: [
          "Fault diagnostics and structural/electrical inspections.",
          "Corrective actions focused on safety and availability.",
          "Lower downtime and higher performance over time.",
        ],
        ctas: [
          { label: "Request a maintenance plan", href: "/contato" },
          { label: "Ask for an intervention quote", href: "/contato" },
        ],
      },
      es: {
        title: "Mantenimiento preventivo y correctivo",
        chip: "O&M",
        summary:
          "Mantenimiento preventivo y correctivo con diagnóstico de fallas, inspección estructural/eléctrica y acciones correctivas para minimizar el downtime y preservar la calidad de los datos.",
        bullets: [
          "Diagnóstico de fallas e inspecciones estructurales/eléctricas.",
          "Acciones correctivas con foco en seguridad y disponibilidad.",
          "Menor downtime y mayor rendimiento en el tiempo.",
        ],
        ctas: [
          { label: "Solicitar plan de mantenimiento", href: "/contato" },
          { label: "Pedir presupuesto de intervención", href: "/contato" },
        ],
      },
    },
  },
];

// ===== Helpers de uso prático no componente =====
export const getServiceBySlug = (slug) => services.find((s) => s.slug === slug);

/**
 * Retorna os textos na língua solicitada, com fallback para PT.
 * Exemplo:
 *   const svc = withLang(getServiceBySlug(slug), currentLang);
 *   <h1>{svc.title}</h1> // já no idioma
 */
export function withLang(service, lang = "pt") {
  if (!service) return null;
  const t = service.i18n?.[lang] || service.i18n?.pt || {};
  return {
    ...service,
    ...t,
  };
}
