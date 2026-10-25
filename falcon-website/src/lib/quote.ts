import { useSyncExternalStore } from "react";
import { company } from "./site";

/* ---- tiny global store so any button on any component can open the quote dialog ---- */
type State = { open: boolean; category: string };
let state: State = { open: false, category: "" };
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => { state = { ...state, ...next }; listeners.forEach((l) => l()); };

export const openQuote = (category = "") => set({ open: true, category });
export const setQuoteOpen = (open: boolean) => set({ open });
export const useQuote = () =>
  useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => state, () => state);

/* ---- submission: POST to VITE_FORM_ENDPOINT if configured, else open a pre-filled email ---- */
export type Inquiry = { kind: "quote" | "contact"; name: string; email: string; phone?: string; subject?: string; category?: string; message: string };
export const hasEndpoint = Boolean(import.meta.env.VITE_FORM_ENDPOINT);

export async function submitInquiry(data: Inquiry): Promise<"sent" | "mailto"> {
  const endpoint = import.meta.env.VITE_FORM_ENDPOINT as string | undefined;
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return "sent";
  }
  const subject = data.kind === "quote" ? `Quote request: ${data.category || "General"}` : data.subject || "Website enquiry";
  const body = [
    `Name: ${data.name}`, `Email: ${data.email}`, data.phone ? `Phone: ${data.phone}` : "", data.category ? `Category: ${data.category}` : "",
    "", data.message,
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");
  window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mailto";
}
