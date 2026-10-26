// Deterministic, explainable lead scoring. Weights are starting points to be re-fitted against closed deals.
export const DEFAULT_SCORING = {
  minInventoryAed: 680000, // cheapest listed property in brand.json; update from live inventory
  hot: 65, warm: 35, nurture: 10,
};

const CHANNEL_POINTS = {
  whatsapp: 10, web_form: 10, landing_page: 10, portal: 10, property_finder: 10, bayut: 10, dubizzle: 10, referral: 10,
  inbound_call: 10, event: 9, email: 6,
  instagram: 6, facebook: 6, tiktok: 6, youtube: 5, linkedin: 6, x: 5, telegram: 6, snapchat: 5, vk: 5,
  wechat: 6, xiaohongshu: 5, douyin: 5, weibo: 5, line: 6, kakaotalk: 6, listening: 1,
};

export function scoreLead(lead, { tier = 2, duplicate = false, config = DEFAULT_SCORING } = {}) {
  const reasons = []; let score = 0;
  const add = (pts, why) => { if (pts) { score += pts; reasons.push(`${pts > 0 ? "+" : ""}${pts} ${why}`); } };

  if (lead.isBroker) return result(-100, ["Identified as another broker/agent: reject"], "reject", config);
  if (duplicate) return result(-100, ["Duplicate of an existing lead: merge, do not create"], "duplicate", config);
  if (!lead.phone && !lead.email && lead.channel !== "listening") return result(-100, ["No usable phone or email"], "reject", config);

  const i = lead.intent;
  const intent = Math.min(40, (i.askedViewing ? 20 : 0) + (i.askedCallback ? 15 : 0) + (i.askedPrice ? 10 : 0) + (i.askedBrochure ? 5 : 0) + (i.formSubmitted ? 8 : 0));
  add(intent, "stated intent");
  add({ immediate: 15, "1-3m": 12, "3-6m": 7, "6m+": 2 }[lead.timeline] ?? 0, `timeline ${lead.timeline}`);

  const b = lead.budgetAed;
  add(b >= 2_000_000 ? 15 : b >= 1_000_000 ? 12 : b >= config.minInventoryAed ? 8 : b > 0 ? 3 : 0, b ? `budget AED ${b.toLocaleString("en-US")}` : "");
  add((lead.purpose !== "unknown" ? 5 : 0) + (lead.finance !== "unknown" ? 5 : 0), "purpose/finance stated");

  add((lead.phone ? 5 : 0) + (lead.email ? 3 : 0) + (lead.name ? 2 : 0), "contact quality");
  if (lead.email && /@(mailinator|10minutemail|guerrillamail|tempmail|yopmail|trashmail|sharklasers)\./.test(lead.email)) add(-10, "disposable email");

  add(CHANNEL_POINTS[lead.channel] ?? 4, `channel ${lead.channel}`);
  add(tier <= 1 ? 5 : 3, `city tier ${tier}`);

  score = Math.max(0, Math.min(100, score));
  const band = score >= config.hot ? "hot" : score >= config.warm ? "warm" : score >= config.nurture ? "nurture" : "cold";
  return { score, band, reasons };
}
function result(score, reasons, band) { return { score, band, reasons }; }
