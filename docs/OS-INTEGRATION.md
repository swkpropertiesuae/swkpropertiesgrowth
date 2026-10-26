# SWK OS integration

Target: `https://os.swkpropertiesuae.com` (repository `swkpropertiesuae/swkpropertiesOS`). Everything below was checked against a **local running copy of SWK OS** built from that repository on 26 October 2026, not only read from the source. It has not been run against the live production instance.

## Contract used

| Purpose | Call | Notes |
| --- | --- | --- |
| Create lead | `POST /api/e/leads` | `Authorization: Bearer elv_…`. Keys skip the browser CSRF header. |
| Find existing lead | `GET /api/e/leads?filters=[{"field":"phone","op":"eq","value":"+9715…"}]` | **Use `filters`, not `q`.** `q` searches only lead number, company and contact name, so phone/e-mail/notes searches silently return nothing (found when a repeat lead created a duplicate during testing). Supported ops include `eq` and `contains`. |
| Add repeat-enquiry note | `GET` then `PUT /api/e/leads/:id` | Appends to `notes`. |
| Look up users / campaigns | `GET /api/e/users/lookup?q=` , `/api/e/campaigns/lookup?q=` | For `owner_id` and `campaign_id`. |
| Status changes back to Growth | OS webhook (`x-swk-signature: sha256=<hmac>`) | Receiver: `POST /intake/os-webhook`. |

## Field mapping

| Growth | OS `leads` field | Rule |
| --- | --- | --- |
| name | `company`, `contact_name` | `company` is required in OS |
| phone / email | `phone`, `email` | Phone in E.164 |
| channel | `source` | WhatsApp, LinkedIn, Website, Portal enquiry, Property Finder, Bayut, Dubizzle, Referral, Exhibition / event, Email campaign, Inbound call; **all social channels map to `Other`** (see change request) |
| consent | `marketing_consent` | `Opted in` only with captured consent; otherwise `Unknown`. Never inferred. |
| city, country | `origin` ("Kochi, IN") | OS label: "Current area (where you own / live)" |
| target community | `destination` | |
| budget | `est_value` | AED |
| purpose / property type | `interest` | Default `Off-Plan Sale` |
| route | `owner_id` | Agent or BDM user id (from env) |
| campaign | `campaign_id` | By campaign name lookup |
| everything else | `notes` | `[SWKGrowth]` block: gid, channel, city id, score and reasons, route and SLA, consent evidence, UTM, source URL |

The `gid` in the note is the idempotency key: re-running an import never creates a second lead.

## Setup (Owner does steps 1–3)

1. In OS create role **Growth Sync** (`crm: view, create, edit`, nothing else) and a user `growth-sync@…` with that role. This user is a service account, not one of the five people.
2. Administration → API keys → create `growth-sync` acting as that user. The key is shown once.
3. Create roles and users for BDM, IT, Agent from `node engine/cli.mjs roles` (see `docs/ACCESS-CONTROL.md`).
4. Copy `engine/.env.example` to `.env`; set `OS_API_KEY`, the user ids and `AGENT_SHIFT`. Leave `OS_SEND=false`.
5. Dry run: `node engine/cli.mjs import export.csv --channel facebook --country IN --basis enquiry`. Review.
6. Set `OS_SEND=true` (or pass `--send`) for the first real batch of ~10; check them in OS; then scale.
7. Run `node engine/cli.mjs serve` behind HTTPS (reverse proxy) and register the Meta and OS webhooks.

## Test results (local OS)

* Lead created through a role-limited key; owner, consent, origin, value and note block stored as mapped.
* Same person arriving via a second channel and a fresh engine store: found by `gid`/phone, merged, **one** OS lead.
* Growth Sync key: can create/read/update leads; `export.csv` → 403; creating an API key → 403.

## Proposed changes to the SWK OS repository (not applied; this session had read-only access)

1. **Native social sources.** Extend `LEAD_SOURCES` in `src/shared/entities/crm.ts` with `Instagram`, `Facebook`, `TikTok`, `YouTube`, `X (Twitter)`, `Telegram`, `Snapchat`, `Google Business`. Until then everything social is `Other`.
2. **Structured attribution fields on `leads`:** `city`, `country`, `channel`, `utm_campaign`, `score`, `consent_evidence`. Today they live in `notes`, which cannot be filtered or reported on.
3. **Row-level scoping** for staff roles (see gap 1 in `docs/ACCESS-CONTROL.md`).
4. **Split `admin` permission** so integrations and API-key creation are not the same grant as role management (gap 2).
5. **Reject API-key creation for a user with higher privileges than the creator.**
