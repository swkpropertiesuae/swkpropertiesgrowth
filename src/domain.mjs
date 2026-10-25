export function calculateROI(price, rent, costs) {
  if (
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isFinite(rent) ||
    rent < 0 ||
    !Number.isFinite(costs) ||
    costs < 0
  )
    return null;
  return {
    gross: (rent / price) * 100,
    net: ((rent - costs) / price) * 100,
    cashflow: rent - costs,
  };
}
export function approvalRole(tier) {
  return tier === 3
    ? "Owner"
    : tier === 2
      ? "Operations Director"
      : tier === 1
        ? "BDM"
        : null;
}
export function mayApprove(role, tier) {
  return (
    role === "Owner" ||
    (tier === 2 && role === "Operations Director") ||
    (tier === 1 && ["BDM", "Operations Director"].includes(role))
  );
}
export function csvCell(value) {
  const s = String(value ?? "");
  return (
    '"' + (/^[=+\-@\t\r]/.test(s) ? "'" + s : s).replaceAll('"', '""') + '"'
  );
}
