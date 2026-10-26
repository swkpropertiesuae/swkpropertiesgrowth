// All configuration comes from the environment. Secrets are never read from, or written to, the repository.
const bool = (v, d = false) => (v === undefined ? d : /^(1|true|yes)$/i.test(v));
export function loadConfig(env = process.env) {
  const shift = (() => { try { return env.AGENT_SHIFT ? JSON.parse(env.AGENT_SHIFT) : null; } catch { throw new Error("AGENT_SHIFT must be JSON, e.g. {\"days\":[\"Mon\",\"Tue\"],\"start\":\"09:00\",\"end\":\"19:00\"}"); } })();
  return {
    os: { baseUrl: env.OS_BASE_URL || "https://os.swkpropertiesuae.com", apiKey: env.OS_API_KEY || "", send: bool(env.OS_SEND, false) },
    owners: { agent: num(env.GROWTH_AGENT_USER_ID), bdm: num(env.GROWTH_BDM_USER_ID), manager: num(env.GROWTH_MANAGER_USER_ID) },
    agentShift: shift ?? { days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], start: "09:00", end: "19:00" },
    intake: { port: num(env.INTAKE_PORT) ?? 8090, secret: env.INTAKE_SECRET || "", osWebhookSecret: env.OS_WEBHOOK_SECRET || "" },
    meta: { appSecret: env.META_APP_SECRET || "", verifyToken: env.META_VERIFY_TOKEN || "", pageToken: env.META_PAGE_TOKEN || "", graphVersion: env.META_GRAPH_VERSION || "v21.0" },
    dataDir: env.GROWTH_DATA_DIR || "./data/runtime",
  };
}
function num(v) { const n = Number(v); return Number.isFinite(n) && v !== undefined && v !== "" ? n : undefined; }
