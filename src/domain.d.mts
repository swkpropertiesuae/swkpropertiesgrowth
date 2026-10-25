export function calculateROI(
  price: number,
  rent: number,
  costs: number,
): { gross: number; net: number; cashflow: number } | null;
export function approvalRole(tier: number): string | null;
export function mayApprove(role: string, tier: number): boolean;
export function csvCell(value: unknown): string;
