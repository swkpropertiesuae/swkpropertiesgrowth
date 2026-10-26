import { windowInGst, fmtMinutes, ARCHETYPES } from "./cities.mjs";

const LANG_NAMES = {
  en: "English", ar: "Arabic", hi: "Hindi", ur: "Urdu", fa: "Persian", tr: "Turkish", ru: "Russian", uk: "Ukrainian",
  zh: "Chinese", fr: "French", de: "German", es: "Spanish", pt: "Portuguese", it: "Italian", nl: "Dutch", pl: "Polish",
  ml: "Malayalam", ta: "Tamil", te: "Telugu", kn: "Kannada", bn: "Bengali", gu: "Gujarati", pa: "Punjabi", mr: "Marathi",
  or: "Odia", as: "Assamese", ne: "Nepali", si: "Sinhala", id: "Indonesian", ms: "Malay", th: "Thai", vi: "Vietnamese",
  ja: "Japanese", ko: "Korean", sw: "Swahili", am: "Amharic", el: "Greek", hu: "Hungarian", ro: "Romanian", bg: "Bulgarian",
  cs: "Czech", sk: "Slovak", sl: "Slovenian", sr: "Serbian", hr: "Croatian", bs: "Bosnian", sq: "Albanian", sv: "Swedish",
  da: "Danish", no: "Norwegian", fi: "Finnish", is: "Icelandic", et: "Estonian", lv: "Latvian", lt: "Lithuanian", mt: "Maltese",
  kk: "Kazakh", uz: "Uzbek", az: "Azerbaijani", ka: "Georgian", hy: "Armenian", ky: "Kyrgyz", tg: "Tajik", mn: "Mongolian",
  km: "Khmer", fil: "Filipino", be: "Belarusian",
};
export const langName = (code) => LANG_NAMES[code] ?? code;

const pascal = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9 ]+/g, " ")
  .split(/\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");

// Twelve evergreen pillars. Wording avoids guaranteed returns, price/availability promises and
// regulatory claims; every figure shown must come from the claims register (docs/COMPLIANCE.md).
export const PILLARS = [
  { id: "buy-process", title: "How buying in Dubai works from {city}", format: "carousel", cta: "Comment GUIDE for the {city} buyer checklist", hook: "Buying in Dubai from {city}: the steps in the order they actually happen." },
  { id: "offplan-plans", title: "Off-plan payment plans explained", format: "reel", cta: "Message us PLAN on WhatsApp for current plans", hook: "80/20, 60/40, 50/50 — what a payment plan means for your cash flow, in 40 seconds." },
  { id: "roi-worksheet", title: "Your numbers, your ROI worksheet", format: "interactive", cta: "Open the ROI worksheet and enter your own figures in {currency}", hook: "Do not trust a yield headline. Put your own rent, costs and price in." },
  { id: "residency", title: "Residency options — check the current rules", format: "carousel", cta: "Comment VISA to get the eligibility checklist", hook: "Does a property purchase qualify you for a UAE residence visa? What to verify before you buy." },
  { id: "funds-transfer", title: "Moving {currency} to AED: questions for your bank", format: "carousel", cta: "Save this list and ask your bank before you transfer", hook: "Five questions to ask your bank before sending {currency} for a Dubai deposit." },
  { id: "meet-consultant", title: "Meet a consultant who works with {country} buyers", format: "video", cta: "Book a 15-minute call", hook: "Who you will actually speak to, how they work, and what they will ask you first." },
  { id: "community-guide", title: "Community guide: where {city} buyers look first", format: "reel", cta: "Comment AREA for the community comparison", hook: "Three Dubai communities, side by side — commute, lifestyle, service charges to check." },
  { id: "viewing-trip", title: "Plan a viewing trip from {city}", format: "carousel", cta: "Message us VIEW to plan a visit or a virtual viewing", hook: "A 3-day itinerary to see properties, developers and neighbourhoods without wasting time." },
  { id: "myth-fact", title: "Myths vs facts: escrow, RERA and your deposit", format: "reel", cta: "Comment TRUST for the protections explained", hook: "Where does your deposit go? How off-plan payments are protected, and what to confirm in writing." },
  { id: "live-qa", title: "Live Q&A for {city} investors", format: "live", cta: "Set a reminder and send your question in advance", hook: "Bring your questions on budget, payment plans and process. We answer live." },
  { id: "launch-watch", title: "New launch watchlist", format: "story", cta: "Join the watchlist on WhatsApp (opt-in)", hook: "Get new launches and payment-plan changes first — one message a month." },
  { id: "rent-vs-buy", title: "Rent vs buy: run it with your own inputs", format: "carousel", cta: "Open the worksheet and compare", hook: "A fair comparison needs your numbers: rent, deposit, fees, holding period." },
];

const fill = (s, c) => s.replaceAll("{city}", c.name).replaceAll("{country}", c.countryName).replaceAll("{currency}", c.currency);

const ROLE_BY_ARCHETYPE_CHANNEL = {
  instagram: "Reels, carousels, stories; comment-keyword opt-in",
  tiktok: "Short video; community guides and myth vs fact",
  youtube: "Long-form explainers and Shorts; chapters and pinned WhatsApp link",
  linkedin: "Investor and professional audience; thought leadership and live events",
  facebook: "Community groups (with admin permission), page posts, lead forms",
  whatsapp: "Opt-in channel, click-to-chat and broadcast with approved templates",
  x: "Market commentary and public replies to intent posts",
  telegram: "Channel for launches and Q&A; community moderation",
  snapchat: "Short vertical video for Saudi and wider GCC audiences",
  vk: "Russian-language community where available",
  wechat: "Official account via an authorised local partner",
  xiaohongshu: "Lifestyle and investor notes via a local partner",
  douyin: "Short video via a local partner",
  weibo: "Brand presence via a local partner",
  line: "Official account for Japanese-speaking audiences",
  kakaotalk: "Channel for Korean-speaking audiences",
  google_business: "Local profile, reviews and enquiries for the UAE office",
};

export function cityBrief(city, date = new Date()) {
  const tag = pascal(city.name), cTag = pascal(city.countryName);
  const evening = windowInGst(city.tz, 19, 22, date);
  const lunch = windowInGst(city.tz, 12, 14, date);
  const arch = ARCHETYPES[city.archetype];
  const perWeek = city.tier <= 1 ? 3 : city.tier === 2 ? 1 : 0;
  return {
    city: city.id,
    headline: `${city.name} → Dubai`,
    audience: `${city.name}, ${city.countryName} (${arch.label})`,
    languages: city.languages.map((l) => ({ code: l, name: langName(l) })),
    rtl: city.rtl,
    currency: city.currency,
    pillars: PILLARS.map((p) => ({ id: p.id, title: fill(p.title, city), format: p.format, hook: fill(p.hook, city), cta: fill(p.cta, city) })),
    channels: city.channels.map((ch, i) => ({ channel: ch, priority: i + 1, role: ROLE_BY_ARCHETYPE_CHANNEL[ch] ?? "Test and measure" })),
    cadence: city.tier === 0
      ? "Always-on: daily short video, weekly live or Q&A, weekly property spotlight."
      : `${perWeek} localised post${perWeek === 1 ? "" : "s"} per week on the primary channel; one live or Q&A per month${city.tier === 1 ? "" : " shared with the language cluster"}.`,
    postingWindows: [
      { label: "Lunch (12:00–14:00 local)", gst: `${fmtMinutes(lunch.start)}–${fmtMinutes(lunch.end)} GST` },
      { label: "Evening (19:00–22:00 local)", gst: `${fmtMinutes(evening.start)}–${fmtMinutes(evening.end)} GST` },
    ],
    hashtags: [`#${tag}ToDubai`, "#DubaiRealEstate", "#DubaiOffPlan", `#${cTag}InDubai`, "#SWKProperties"],
    leadMagnets: [
      `${city.name} buyer's guide to Dubai (PDF, ${langName(city.languages[0])})`,
      `ROI worksheet in ${city.currency} with transparent inputs`,
      "Off-plan launch watchlist (WhatsApp opt-in)",
      "Residency eligibility checklist (verify current rules)",
    ],
    note: arch.note,
    complianceChecklist: [
      "Property advertisements carry the current advertising permit number and QR code required by the regulator.",
      "No guaranteed returns, no price or availability claims without a dated source on the claims register.",
      "Consent captured with the wording, timestamp and source URL; WhatsApp outreach only to opted-in contacts.",
      "Local-law check for this market (see jurisdiction table in the compliance guide) before paid or direct outreach.",
    ],
  };
}
