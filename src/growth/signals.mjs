// Public-post intent signals. A signal is NOT a lead: it is a prompt for a person to reply publicly from the brand account.
// We keep the minimum (platform, post URL, public handle, short excerpt) and purge unconverted signals after 30 days.
export const SIGNAL_RETENTION_DAYS = 30;

// Seed phrase packs per language. Tune from real replies; keep in version control with a change log.
const PACKS = {
  en: { buy: [/\b(buy|buying|purchase|invest(ing)?|looking for)\b.{0,40}\b(property|flat|apartment|villa|off[- ]?plan|real estate)\b.{0,40}\bdubai\b/i, /\boff[- ]?plan\b.{0,30}\bdubai\b/i, /\bdubai\b.{0,40}\b(payment plan|golden visa|roi|rental yield)\b/i], rent: [/\b(rent|renting|lease)\b.{0,30}\b(dubai)\b/i], question: [/\b(is it (safe|worth)|how (do|to)|can (i|foreigners))\b.{0,50}\b(buy|invest).{0,30}\bdubai\b/i] },
  ar: { buy: [/(شراء|استثمار|أبحث عن).{0,30}(عقار|شقة|فيلا).{0,30}دبي/, /دبي.{0,30}(خطة دفع|على الخريطة)/], rent: [/(إيجار|استئجار).{0,20}دبي/], question: [] },
  ru: { buy: [/(купить|покупка|инвестиц).{0,40}(недвижимост|квартир|вилл).{0,40}(дубае|дубай)/i, /(дубае|дубай).{0,40}(рассрочк|план платеж)/i], rent: [/(снять|аренда).{0,30}(дубае|дубай)/i], question: [] },
  hi: { buy: [/(दुबई).{0,40}(प्रॉपर्टी|फ्लैट|घर).{0,30}(खरीद|निवेश)/, /dubai.{0,30}(property|flat).{0,30}(kharid|invest)/i], rent: [], question: [] },
  fr: { buy: [/(acheter|investir|achat).{0,40}(appartement|villa|immobilier|bien).{0,40}(à )?duba[iï]/i], rent: [], question: [] },
  es: { buy: [/(comprar|invertir).{0,40}(propiedad|apartamento|inmueble|villa).{0,40}duba[ií]/i], rent: [], question: [] },
  zh: { buy: [/迪拜.{0,20}(买房|购房|投资|房产)/, /(买房|购房|房产投资).{0,20}迪拜/], rent: [], question: [] },
  tr: { buy: [/(satın al|yatırım).{0,40}(daire|villa|gayrimenkul).{0,40}dubai/i], rent: [], question: [] },
};

const SELLER = /\b(for sale by|my listing|broker here|agent here|dm for|whatsapp me|call me|ready units|available now)\b|للبيع|أنا وسيط/i;

export function classifySignal(text) {
  const t = String(text ?? "");
  if (!t.trim() || t.length > 4000) return { intent: "none", score: 0, matched: [] };
  if (SELLER.test(t)) return { intent: "competitor_or_promo", score: 0, matched: [] };
  const matched = [];
  let best = "none", score = 0;
  for (const [lang, pack] of Object.entries(PACKS)) {
    for (const [kind, res] of Object.entries(pack)) {
      for (const re of res) if (re.test(t)) {
        matched.push(`${lang}:${kind}`);
        const s = kind === "buy" ? 80 : kind === "question" ? 50 : 40;
        if (s > score) { score = s; best = kind === "buy" ? "buy" : kind; }
      }
    }
  }
  return { intent: best, score, matched };
}

export function toSignal({ platform, url, handle, text, city, detectedAt = new Date() }) {
  const c = classifySignal(text);
  if (c.intent === "none" || c.intent === "competitor_or_promo") return null;
  return {
    platform, url, handle: String(handle ?? "").slice(0, 80),
    excerpt: String(text).replace(/\s+/g, " ").slice(0, 280),
    city: city ?? "", intent: c.intent, score: c.score, matched: c.matched,
    detectedAt: detectedAt.toISOString(),
    action: "A person replies publicly from the brand account with useful, non-promotional help and an opt-in link. No DM, no cold call.",
  };
}

export const purgeSignals = (signals, now = new Date(), days = SIGNAL_RETENTION_DAYS) =>
  signals.filter((s) => s.converted || now - new Date(s.detectedAt) < days * 86_400_000);
