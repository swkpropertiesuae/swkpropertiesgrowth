# Verification — 25 October 2026

- `npm run build`: TypeScript strict check and production Vite build passed.
- `npm test`: four domain tests passed: ROI arithmetic, invalid/non-finite inputs, approval permission boundaries, and CSV formula/quote handling.
- Browser QA: desktop public site and demo overview inspected visually; authentic imagery and all five source team entries rendered.
- Browser task flow: created a synthetic task, saved successfully, reloaded the page, and found it through global search. The dashboard task count updated from three to four in the test browser. An HTTP-preview compatibility bug in UUID generation was found and fixed with a local identifier fallback.
- Browser approval flow: generated a Tier 1 internal draft, approved it as demo Owner and verified the status/audit record. Created a Tier 3 draft, changed to Sales, and verified approval was disabled. No external action executed.
- Browser intelligence flow: criteria-based Dubai apartment matching returned the two matching source records. Scenario calculator displayed the expected 2/5/8 hypothetical enquiries and USD 500/200/125 costs for the default assumptions.
- Responsive harness: public site and workspace checked in 375px, 768px and 1600px frames. Measured document scroll width did not exceed client width (native scrollbar reduced some effective client widths by 15px). Mobile public site and workspace inspected visually. The temporary harness is excluded from the delivered repository.
- Native dialogs use browser focus trapping and Escape dismissal; semantic navigation, input labels, focus outlines and reduced-motion CSS are included. A full assistive-technology or WCAG conformance audit was not performed.

These are local build and browser checks, not verification of a deployed production service. No Lighthouse score, load test, regulatory certification, real market feed, live backend, or production security audit is asserted. Browser test records stay in the test browser and are not committed as seed data.
