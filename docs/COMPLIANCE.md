# Compliance guide

Working notes for the team, not legal advice. Have counsel confirm every row below before launch and again when a new market is added.

## Rules we enforce in code

| Rule | Where |
| --- | --- |
| A person who did not enquire and did not consent is never turned into a CRM lead (`signal` queue only) | `assign.mjs`, `sync.mjs` |
| `marketing_consent = Opted in` only with consent captured; otherwise `Unknown` | `os-crm.mjs`, `mappers.mjs` |
| Consent wording, timestamp and source URL travel in the OS note | `os-crm.mjs` |
| Brokers and duplicates are rejected or merged, not routed | `scoring.mjs` |
| Public-post signals keep a 280-character excerpt and are purged after 30 days unless converted | `signals.mjs` |
| Intake endpoints verify an HMAC signature, cap body size and rate-limit | `intake-server.mjs` |
| Ledger file is owner-readable only | `store.mjs` |
| No marketing copy contains guarantee language (test) | `tests/growth.test.mjs` |

## Jurisdictions (starting point for legal review)

| Where the lead is | Law to check | Practical rule |
| --- | --- | --- |
| UAE | Federal Decree-Law 45 of 2021 (PDPL); telecom and marketing rules of the regulator; RERA/DLD advertising rules | Consent or an enquiry before contact; store evidence; permit number and QR code on property ads; honour opt-out immediately |
| United Kingdom | UK GDPR, PECR | Opt-in for electronic marketing; right to object |
| EU / EEA | GDPR, ePrivacy | Explicit opt-in, data-subject rights, check transfer basis when data is stored in the UAE |
| India | Digital Personal Data Protection Act 2023, telecom commercial-communication rules | Consent notice in plain language; check DND rules before calls |
| Saudi Arabia | PDPL | Consent and transfer rules apply to Saudi residents |
| China (mainland) | PIPL | Separate consent; operate through an authorised local partner |
| USA / Canada | TCPA, state laws, CASL, CAN-SPAM | Written consent for texts and calls; CASL consent for Canada |
| Brazil | LGPD | Legal basis and consent record |
| Russia | Sanctions and local data-localisation rules | Screen for sanctions before any transaction; take advice before storing data of Russian residents |

## Platform rules

* **WhatsApp**: message people only after opt-in; use approved templates outside the 24-hour window.
* **Meta, TikTok, LinkedIn, X**: automation only through official APIs; no scraping; no fake engagement; respect rate limits.
* **Search**: city pages must carry unique value; do not mass-publish near-duplicates.
* **Listening data**: use only public posts through licensed providers or official APIs; reply publicly from the brand account; do not message the author privately.

## Property marketing

* Advertising permit number and QR code on every property ad (confirm the current format with RERA/DLD).
* No guaranteed or implied returns; ROI shown as the user's own arithmetic.
* Prices, payment plans, handover dates and availability only from the claims register with a source and date.
* Sanctions and AML/DNFBP screening happen in SWK OS before any transaction, regardless of lead source.

## Claims register (template)

| Claim | Source (document / URL) | Date checked | Checked by | Expires |
| --- | --- | --- | --- | --- |
| | | | | |

## Retention

Leads follow the OS retention policy. Signals: 30 days. Engine ledger: keep for audit, no raw PII beyond hashed dedupe keys and OS ids. Deletion requests: delete in OS, then remove the gid line from the ledger.
