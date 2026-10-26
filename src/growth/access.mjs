// Access policy for the Growth workspace. Authoritative enforcement belongs on the server (SWK OS roles / API);
// this module is the single source of truth for what each role may do and is used by the UI and the sync engine.
export const GROWTH_ROLES = ["Owner", "Manager", "BDM", "IT Admin", "Agent"];
export const MAX_SEATS = { Owner: 1, Manager: 1, BDM: 1, "IT Admin": 1, Agent: 1 };

export const ACTIONS = [
  "view_dashboard", "view_reports", "view_all_leads", "view_own_leads", "view_pii", "edit_lead", "assign_lead",
  "export_leads", "delete_lead", "manage_campaigns", "manage_content", "approve_tier1", "approve_tier2", "approve_tier3",
  "manage_integrations", "manage_api_keys", "run_sync", "view_audit", "view_system_health", "manage_access",
];

const set = (...a) => new Set(a);
export const POLICY = {
  Owner: set(...ACTIONS),
  Manager: set("view_dashboard", "view_reports", "view_all_leads", "view_pii", "edit_lead", "assign_lead", "export_leads", "manage_campaigns", "manage_content", "approve_tier1", "approve_tier2", "run_sync", "view_audit"),
  BDM: set("view_dashboard", "view_reports", "view_all_leads", "view_pii", "edit_lead", "assign_lead", "manage_campaigns", "manage_content", "approve_tier1", "run_sync"),
  // IT runs the platform, not the pipeline: no lead PII, no exports, no approvals. IT cannot mint API keys or change roles:
  // in SWK OS a key can act as any user, so key and role changes are Owner-only (IT prepares, Owner executes).
  "IT Admin": set("view_dashboard", "manage_integrations", "run_sync", "view_audit", "view_system_health"),
  // The single agent works only the leads assigned to them.
  Agent: set("view_dashboard", "view_own_leads", "view_pii", "edit_lead"),
};

const OWN_ONLY = new Set(["view_pii", "edit_lead"]);

/** can("Agent", "edit_lead", { userId: "u7", lead: { ownerId: "u7" } }) */
export function can(role, action, ctx = {}) {
  const allowed = POLICY[role];
  if (!allowed || !allowed.has(action)) return false;
  if (role === "Agent" && OWN_ONLY.has(action)) return !!ctx.lead && !!ctx.userId && ctx.lead.ownerId === ctx.userId;
  return true;
}

/** Validates a roster of { id, email, role, active }. Throws on any seat violation or unknown role. */
export function assertSeats(users) {
  const counts = {};
  for (const u of users.filter((x) => x.active !== false)) {
    if (!GROWTH_ROLES.includes(u.role)) throw new Error(`Role "${u.role}" is not allowed on Growth (user ${u.email ?? u.id})`);
    counts[u.role] = (counts[u.role] ?? 0) + 1;
    if (counts[u.role] > MAX_SEATS[u.role]) throw new Error(`Seat limit exceeded for ${u.role} (max ${MAX_SEATS[u.role]})`);
  }
  const emails = users.filter((u) => u.active !== false).map((u) => String(u.email ?? "").toLowerCase()).filter(Boolean);
  if (new Set(emails).size !== emails.length) throw new Error("One person cannot hold two Growth seats");
  return counts;
}

export function maskLead(lead) {
  const maskPhone = (p) => (p ? p.slice(0, 4) + "•".repeat(Math.max(0, p.length - 7)) + p.slice(-3) : p);
  const maskEmail = (e) => (e ? e.replace(/^(.).*(@.*)$/, "$1•••$2") : e);
  return { ...lead, name: lead.name ? lead.name.split(" ")[0] + " •••" : lead.name, phone: maskPhone(lead.phone), email: maskEmail(lead.email) };
}

/**
 * Permission objects in SWK OS role format (module -> actions), matching src/server/seed/index.ts conventions.
 * Verified against a local SWK OS instance (see docs/ACCESS-CONTROL.md for the test results and the known gaps).
 */
export function osRoleDefinitions() {
  const V = ["view"];
  return [
    { growth: "Owner", osRole: "Admin", create: false, note: "Use the existing system Admin role. Only the Owner creates API keys and changes roles." },
    { growth: "Manager", osRole: "Manager", create: false, note: "Use the existing system Manager role (all modules)." },
    { growth: "BDM", osRole: "Growth BDM", create: true, description: "Growth BDM: triage, assignment and campaign management. No export or delete.", permissions: { dashboard: V, crm: ["view", "create", "edit"], sales: ["view", "create", "edit"], reports: V, projects: ["view", "create", "edit"], documents: V, masters: V } },
    // `admin` write access lets a role mint API keys that act as any user (privilege escalation), so IT is read-only on `admin`.
    { growth: "IT Admin", osRole: "Growth IT", create: true, description: "Growth IT: read-only platform visibility; no customer records, no key or role changes", permissions: { dashboard: V, admin: V, masters: V } },
    { growth: "Agent", osRole: "Growth Agent", create: true, description: "Growth Agent: works leads; OS cannot yet restrict to own leads", permissions: { dashboard: V, crm: ["view", "create", "edit"], documents: V, masters: V } },
    { growth: "(service)", osRole: "Growth Sync", create: true, service: true, description: "Service account for the lead sync key: create/read/update CRM leads only", permissions: { crm: ["view", "create", "edit"] } },
  ];
}
