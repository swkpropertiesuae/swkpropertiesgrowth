import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { hasEndpoint, setQuoteOpen, submitInquiry, useQuote } from "@/lib/quote";
import { quoteOptions } from "@/lib/site";

export function QuoteDialog() {
  const { open, category } = useQuote();
  const [cat, setCat] = useState(quoteOptions[0]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setCat(category || quoteOptions[0]); }, [open, category]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("website")) return; // honeypot
    setBusy(true);
    try {
      const mode = await submitInquiry({
        kind: "quote", name: String(f.get("name")), email: String(f.get("email")), phone: String(f.get("phone") || ""),
        category: cat, message: String(f.get("message") || ""),
      });
      setQuoteOpen(false);
      toast.success(mode === "sent" ? "Quote request sent" : "Your email app is opening", {
        description: mode === "sent" ? "Our sourcing team will reply within one business day." : "Press send in your email app to deliver the request.",
      });
    } catch {
      toast.error("Couldn't send the request", { description: "Please email info@falconequipmenttrading.com or call +971 4 370 6130." });
    } finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setQuoteOpen}>
      <DialogContent>
        <Badge>Request a Quote</Badge>
        <DialogTitle className="mt-4 font-display text-3xl font-bold">Tell us what you need.</DialogTitle>
        <DialogDescription className="mt-2 text-[15px] text-muted-foreground">
          Share a few details and our sourcing team will get back to you with pricing and lead time.
        </DialogDescription>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="q-name">Full name</Label><Input id="q-name" name="name" required placeholder="Your name" autoComplete="name" /></div>
            <div className="grid gap-2"><Label htmlFor="q-email">Email</Label><Input id="q-email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="q-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="q-phone" name="phone" type="tel" placeholder="+971 …" autoComplete="tel" /></div>
          <div className="grid gap-2">
            <Label htmlFor="q-cat">Product category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger id="q-cat"><SelectValue /></SelectTrigger>
              <SelectContent>{quoteOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label htmlFor="q-msg">Details</Label><Textarea id="q-msg" name="message" required placeholder="Quantities, specs, timeline…" /></div>
          <Button type="submit" size="lg" disabled={busy} className="mt-1 w-full">
            {busy ? <Loader2 className="animate-spin" /> : <Send />} Send Request
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {hasEndpoint ? "We respond within one business day. No spam, ever." : "This opens a pre-filled email to our sourcing team. We respond within one business day."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
