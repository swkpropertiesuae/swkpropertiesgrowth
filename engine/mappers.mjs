// Map third-party exports into the canonical raw lead shape (before normalisation).
const ALIASES = {
  name: ["name", "full_name", "fullname", "contact_name", "customer_name", "first_name"],
  phone: ["phone", "phone_number", "mobile", "mobile_number", "whatsapp", "contact_number", "telephone"],
  email: ["email", "email_address", "e-mail"],
  city: ["city", "location", "current_city", "town"],
  countryCode: ["country_code", "country"],
  budgetAed: ["budget_aed", "budget"],
  timeline: ["timeline", "buying_timeline"],
  purpose: ["purpose"],
  campaign: ["campaign", "campaign_name", "utm_campaign"],
  notes: ["notes", "message", "comment", "comments"],
};
const pick = (row, keys) => { for (const k of keys) { const hit = Object.keys(row).find((h) => h.toLowerCase() === k); if (hit && String(row[hit]).trim()) return row[hit]; } return ""; };
const TRUTHY = /^(1|true|yes|y|opted[ _-]?in|agree|agreed|accepted)$/i;

export function fromCsvRow(row, { channel = "web_form", defaultCountry, basis } = {}) {
  const consentRaw = pick(row, ["consent", "marketing_consent", "opt_in", "optin", "whatsapp_opt_in"]);
  const country = String(pick(row, ALIASES.countryCode) || defaultCountry || "").trim();
  const budget = String(pick(row, ALIASES.budgetAed)).replace(/[^\d.]/g, "");
  return {
    name: pick(row, ALIASES.name), phone: pick(row, ALIASES.phone), email: pick(row, ALIASES.email),
    city: pick(row, ALIASES.city), countryCode: country.length === 2 ? country.toUpperCase() : defaultCountry,
    budgetAed: budget ? Number(budget) : 0,
    timeline: pick(row, ALIASES.timeline), purpose: pick(row, ALIASES.purpose),
    campaign: pick(row, ALIASES.campaign), notes: pick(row, ALIASES.notes), channel,
    intent: { formSubmitted: basis !== "none" },
    consent: {
      marketing: TRUTHY.test(consentRaw),
      basis: TRUTHY.test(consentRaw) ? "consent" : basis ?? undefined,
      text: consentRaw ? `CSV import consent column: ${consentRaw}` : "",
    },
  };
}

const META_FIELDS = { full_name: "name", email: "email", phone_number: "phone", city: "city", budget: "budgetAed", timeline: "timeline", purpose: "purpose" };
/** Meta Lead Ads Graph API lead object -> raw lead. Instant-form submission is an enquiry; marketing consent only if the form had a consent checkbox. */
export function fromMetaLead(lead, { consentFieldName = "consent" } = {}) {
  const out = { channel: lead.platform === "ig" ? "instagram" : "facebook", intent: { formSubmitted: true }, consent: {}, utm: { utm_source: lead.platform === "ig" ? "instagram" : "facebook", utm_medium: "lead_ad" } };
  let consentValue;
  for (const f of lead.field_data ?? []) {
    const v = Array.isArray(f.values) ? f.values[0] : f.values;
    if (f.name === consentFieldName) consentValue = v;
    else if (META_FIELDS[f.name]) out[META_FIELDS[f.name]] = v;
  }
  if (lead.campaign_name) out.campaign = lead.campaign_name;
  out.consent = { marketing: TRUTHY.test(String(consentValue ?? "")), text: consentValue ? `Meta instant form consent field: ${consentValue}` : "", capturedAt: lead.created_time };
  out.sourceUrl = lead.id ? `meta-lead:${lead.id}` : "";
  return out;
}
