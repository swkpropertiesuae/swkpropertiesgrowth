// Normalisation helpers. Format checks only: not proof a number or mailbox exists.
export const DIAL = {
  AE: "971", SA: "966", KW: "965", QA: "974", BH: "973", OM: "968", JO: "962", LB: "961", IQ: "964", IR: "98", EG: "20",
  TR: "90", CY: "357", MA: "212", DZ: "213", TN: "216", IN: "91", PK: "92", BD: "880", LK: "94", NP: "977", RU: "7",
  UA: "380", BY: "375", KZ: "7", UZ: "998", AZ: "994", GE: "995", AM: "374", KG: "996", TJ: "992", MD: "373", GB: "44",
  IE: "353", DE: "49", FR: "33", NL: "31", BE: "32", CH: "41", AT: "43", LU: "352", MC: "377", IT: "39", ES: "34",
  PT: "351", GR: "30", MT: "356", HR: "385", SE: "46", DK: "45", NO: "47", FI: "358", IS: "354", EE: "372", LV: "371",
  LT: "370", PL: "48", CZ: "420", SK: "421", HU: "36", RO: "40", BG: "359", RS: "381", SI: "386", AL: "355", BA: "387",
  NG: "234", GH: "233", KE: "254", ZA: "27", ET: "251", TZ: "255", UG: "256", RW: "250", ZM: "260", ZW: "263", MZ: "258",
  AO: "244", SN: "221", CI: "225", CM: "237", CD: "243", TG: "228", MU: "230", BW: "267", NA: "264", CN: "86", HK: "852",
  TW: "886", JP: "81", KR: "82", MN: "976", SG: "65", MY: "60", ID: "62", TH: "66", VN: "84", PH: "63", KH: "855",
  US: "1", CA: "1", MX: "52", BR: "55", AR: "54", CL: "56", CO: "57", PE: "51", UY: "598", PA: "507", CR: "506",
  DO: "1", EC: "593", JM: "1", AU: "61", NZ: "64",
};

/** Returns an E.164 string (+<digits>) or null when the input cannot be a phone number. */
export function normalizePhone(raw, defaultCountry = "AE") {
  if (raw == null) return null;
  let s = String(raw).trim();
  if (!s) return null;
  const plus = s.startsWith("+");
  let d = s.replace(/\D/g, "");
  if (!d) return null;
  if (!plus && d.startsWith("00")) d = d.slice(2);
  else if (!plus) {
    const cc = DIAL[defaultCountry];
    if (!cc) return null;
    if (d.startsWith("0")) d = cc + d.replace(/^0+/, "");
    // Without "+" or "00" we cannot be sure the country code is present. Treat it as present only when the digits start with it
    // AND the total is long enough to be a full international number (>= 11 digits); otherwise it is a national number.
    else if (!(d.startsWith(cc) && d.length >= 11)) d = cc + d;
  }
  if (d.length < 8 || d.length > 15) return null;
  return "+" + d;
}

const DISPOSABLE = new Set(["mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com", "yopmail.com", "trashmail.com", "sharklasers.com"]);
export function normalizeEmail(raw) {
  if (!raw) return null;
  const e = String(raw).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null;
}
export const isDisposableEmail = (e) => !!e && DISPOSABLE.has(e.split("@")[1]);

// Growth channel -> existing SWK OS lead source (OS LEAD_SOURCES). Social channels have no native value yet
// (see docs/OS-INTEGRATION.md for the proposed OS change), so they map to "Other" and carry the channel in the note block.
export const OS_SOURCE = {
  whatsapp: "WhatsApp", linkedin: "LinkedIn", web_form: "Website", landing_page: "Website", portal: "Portal enquiry",
  property_finder: "Property Finder", bayut: "Bayut", dubizzle: "Dubizzle", referral: "Referral", event: "Exhibition / event",
  email: "Email campaign", inbound_call: "Inbound call",
};
export const osSource = (channel) => OS_SOURCE[channel] ?? "Other";

export const CHANNELS = [
  "instagram", "facebook", "tiktok", "youtube", "linkedin", "x", "telegram", "snapchat", "vk", "wechat", "xiaohongshu",
  "douyin", "weibo", "line", "kakaotalk", "whatsapp", "web_form", "landing_page", "portal", "property_finder", "bayut",
  "dubizzle", "referral", "event", "email", "inbound_call", "listening",
];

/** Stable key used for duplicate detection: phone digits, else email, else null. */
export function dedupeKeys(lead) {
  const keys = [];
  if (lead.phone) keys.push("p:" + lead.phone.replace(/\D/g, ""));
  if (lead.email) keys.push("e:" + lead.email);
  return keys;
}

export function canonicalLead(input, { defaultCountry = "AE", now = new Date() } = {}) {
  const country = (input.countryCode || defaultCountry || "AE").toUpperCase();
  const phone = normalizePhone(input.phone, country);
  const email = normalizeEmail(input.email);
  const channel = CHANNELS.includes(input.channel) ? input.channel : "web_form";
  const consent = input.consent ?? {};
  return {
    name: String(input.name ?? "").trim().slice(0, 120),
    phone, email, channel,
    city: String(input.city ?? "").trim(), countryCode: country,
    campaign: String(input.campaign ?? "").trim(),
    utm: input.utm ?? {},
    sourceUrl: String(input.sourceUrl ?? "").slice(0, 500),
    intent: {
      askedPrice: !!input.intent?.askedPrice, askedViewing: !!input.intent?.askedViewing,
      askedCallback: !!input.intent?.askedCallback, askedBrochure: !!input.intent?.askedBrochure,
      formSubmitted: !!input.intent?.formSubmitted,
    },
    budgetAed: Number.isFinite(+input.budgetAed) && +input.budgetAed > 0 ? +input.budgetAed : 0,
    timeline: ["immediate", "1-3m", "3-6m", "6m+"].includes(input.timeline) ? input.timeline : "unknown",
    purpose: ["investment", "residence", "golden_visa"].includes(input.purpose) ? input.purpose : "unknown",
    finance: ["cash", "mortgage"].includes(input.finance) ? input.finance : "unknown",
    interest: String(input.interest ?? "").trim(),
    destination: String(input.destination ?? "").trim(),
    isBroker: !!input.isBroker,
    notes: String(input.notes ?? "").trim().slice(0, 1000),
    consent: {
      marketing: consent.marketing === true,
      // "enquiry" = the person asked us to contact them (form, WhatsApp message, call). "none" = we found them, they did not ask.
      basis: consent.basis ?? (consent.marketing ? "consent" : input.intent?.formSubmitted || ["whatsapp", "web_form", "landing_page", "portal", "inbound_call"].includes(channel) ? "enquiry" : "none"),
      text: String(consent.text ?? "").slice(0, 400),
      capturedAt: consent.capturedAt ?? now.toISOString(),
    },
  };
}
