// Routing. Pure function: takes the scored lead and a snapshot of team state, returns where it goes and why.
export const DEFAULT_ROUTING = {
  vipBudgetAed: 5_000_000,
  agentCapacity: 15,          // max concurrently active leads for the single agent
  agentSoftLimit: 0.7,        // warm leads stop going to the agent above 70% of capacity
  slaMinutes: { hot: 5, warm: 30, nurture: 1440, signal: 240 },
};

const minutesNowGst = (now) => {
  const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hourCycle: "h23", hour: "2-digit", minute: "2-digit", weekday: "short" }).formatToParts(now);
  const v = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return { minutes: +v.hour * 60 + +v.minute, weekday: v.weekday };
};

/** shift = { days: ["Mon",...], start: "09:00", end: "19:00" } in GST. */
export function onShift(shift, now = new Date()) {
  if (!shift) return false;
  const { minutes, weekday } = minutesNowGst(now);
  const [sh, sm] = shift.start.split(":").map(Number), [eh, em] = shift.end.split(":").map(Number);
  return shift.days.includes(weekday) && minutes >= sh * 60 + sm && minutes < eh * 60 + em;
}

export function assignLead(lead, scored, team, config = DEFAULT_ROUTING, now = new Date()) {
  const out = (queue, owner, reason, sla) => ({ queue, owner, reason, slaMinutes: sla ?? config.slaMinutes[scored.band] ?? null });

  if (scored.band === "reject" || scored.band === "duplicate") return out("none", null, scored.reasons[0], null);

  // Found by listening, never asked us to get in touch: a person replies publicly from the brand account. No DM, no cold call.
  if (lead.consent.basis === "none") return out("signal", "bdm", "No enquiry or consent: public reply by a person only", config.slaMinutes.signal);

  if (scored.band === "cold" || scored.band === "nurture") return out("nurture", "bdm", "Low intent: opted-in nurture only", config.slaMinutes.nurture);

  const vip = lead.budgetAed >= config.vipBudgetAed;
  if (vip) return out("bdm", "bdm", `Budget at or above AED ${config.vipBudgetAed.toLocaleString("en-US")}: BDM leads, manager informed`, 5);

  const agent = team.agent;
  const agentFree = agent && onShift(agent.shift, now);
  const load = agent ? agent.activeLeads / config.agentCapacity : 1;
  if (agentFree && scored.band === "hot" && load < 1) return out("agent", "agent", "Hot lead, agent on shift with capacity");
  if (agentFree && scored.band === "warm" && load < config.agentSoftLimit) return out("agent", "agent", "Warm lead, agent below soft limit");
  const why = !agent ? "No agent seat configured" : !agentFree ? "Agent off shift" : "Agent at capacity";
  return out("bdm", "bdm", `${why}: BDM triages`, scored.band === "hot" ? 15 : config.slaMinutes[scored.band]);
}
