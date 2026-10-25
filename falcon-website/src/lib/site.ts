import { Cog, Gauge, HardHat, Settings2, Waves, type LucideIcon } from "lucide-react";

export const company = {
  name: "Falcon Equipment Trading FZE LLC",
  short: "Falcon Equipment Trading",
  phone: "+971 4 370 6130",
  phoneHref: "tel:+97143706130",
  email: "info@falconequipmenttrading.com",
  hrEmail: "hr@falconequipmenttrading.com",
  addressLines: ["Office No. CWS 496, 26th Floor, Amber Gem Tower,", "Sheikh Khalifa Street, Ajman, UAE", "P.O. Box 484822"],
  mapQuery: "Amber Gem Tower, Sheikh Khalifa Street, Ajman, UAE",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about.html" },
  { label: "Products", href: "/products.html" },
  { label: "Contact", href: "/contact.html" },
];

export type Category = {
  id: string; num: string; title: string; short: string; body: string; image?: string; icon: LucideIcon; tags: string[];
};

export const categories: Category[] = [
  {
    id: "pumps", num: "01", title: "Pumps, Compressors & Fluid Handling", short: "Pumps & Compressors",
    body: "Industrial-grade centrifugal, submersible and positive-displacement pumps; air and gas compressors; hydraulic power packs and associated spares for oil & gas, water treatment and plant operations.",
    image: "/img/pumps.webp", icon: Waves, tags: ["Centrifugal", "Submersible", "Positive-displacement", "Compressors", "Hydraulic power packs"],
  },
  {
    id: "valves", num: "02", title: "Valves, Actuators & Flow Control", short: "Valves & Actuators",
    body: "Gate, globe, ball, butterfly and control valves with pneumatic/electric actuators, plus flow meters and regulators for precise fluid and gas control in process plants and pipelines.",
    image: "/img/valves.webp", icon: Settings2, tags: ["Gate & globe", "Ball & butterfly", "Control valves", "Actuators", "Flow meters"],
  },
  {
    id: "automation", num: "03", title: "Industrial Automation & Instrumentation", short: "Automation",
    body: "Sensors, transmitters, PLCs, VFDs, control panels and field instrumentation for automation of manufacturing lines, utilities and oilfield facilities.",
    icon: Gauge, tags: ["Sensors", "Transmitters", "PLCs", "VFDs", "Control panels"],
  },
  {
    id: "safety", num: "04", title: "Safety, PPE & Site Support Equipment", short: "Safety & PPE",
    body: "Personal protective equipment, fire suppression systems, gas detectors, safety signage and site support tools to meet UAE HSE requirements.",
    image: "/img/site-support.webp", icon: HardHat, tags: ["PPE", "Fire suppression", "Gas detectors", "Signage", "Site tools"],
  },
  {
    id: "spares", num: "05", title: "Mechanical Spares & Industrial Components", short: "Mechanical Spares",
    body: "Bearings, seals, gaskets, couplings, chains, sprockets, belts, fasteners and general MRO spares to keep plants running with minimal downtime.",
    image: "/img/spares.webp", icon: Cog, tags: ["Bearings", "Seals & gaskets", "Couplings", "Chains & belts", "Fasteners"],
  },
];

export const quoteOptions = [...categories.map((c) => c.title), "Other / not sure"];

export const whyUs = [
  { title: "Quality You Can Trust", body: "Reliable industrial equipment and spare parts sourced with a strong focus on quality, performance and durability." },
  { title: "Industry-Focused Expertise", body: "Practical knowledge of industrial equipment and spare parts helps us understand your requirements and recommend the right solutions." },
  { title: "Fast & Reliable Supply", body: "We value your time and work to provide efficient sourcing, competitive lead times and dependable delivery solutions." },
  { title: "Customer-Centric Service", body: "Every client relationship is built on responsiveness, transparency and a genuine understanding of your operational needs." },
];

export const testimonials = [
  { quote: "Falcon sourced a pump assembly for us in days, not weeks. Spec was exact and the lead time held.", role: "Plant Manager", org: "Water Treatment, Ajman" },
  { quote: "Their instrumentation stock saved a shutdown from running long. Straightforward people to deal with.", role: "Maintenance Lead", org: "Manufacturing, Sharjah" },
  { quote: "Consistent PPE and safety supply across three sites, with one point of contact. That's the whole ask.", role: "HSE Coordinator", org: "Oil & Gas, UAE" },
];

export const faqs = [
  { q: "Do you supply across the whole UAE, or only Ajman?", a: "We deliver UAE-wide, including Ajman, Dubai, Sharjah and the Northern Emirates, with lead times depending on stock and specification." },
  { q: "Can you source equipment that isn't in your standard catalogue?", a: "Yes. Our sourcing team regularly procures specific makes, models and spares to match a client's exact requirement. Use the quote form and describe the specification." },
  { q: "Do you supply to oil & gas and process plants directly?", a: "Yes, a large share of our pumps, valves and instrumentation lines go directly into oil & gas, water treatment and manufacturing plant operations." },
  { q: "How do I request a formal quotation?", a: "Use the “Get a Quote” button on any page, or the contact form, with quantities, specifications and your timeline. Our team responds within one business day." },
];

export const marqueeTerms = [
  "Centrifugal pumps", "Air & gas compressors", "Hydraulic power packs", "Ball valves", "Butterfly valves", "Control valves", "Pneumatic actuators",
  "Flow meters", "PLCs", "VFDs", "Transmitters", "Control panels", "PPE", "Fire suppression", "Gas detectors", "Bearings", "Seals & gaskets",
  "Couplings", "Chains & sprockets", "Fasteners",
];
