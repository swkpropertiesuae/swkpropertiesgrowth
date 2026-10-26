# Access control

Growth is restricted to **five seats**: Owner, Manager, BDM, IT Admin and **one** Agent. No other role may be given access. The policy lives in `src/growth/access.mjs` (`POLICY`, `assertSeats`, `can`); the Lead engine page shows the matrix.

| Action | Owner | Manager | BDM | IT Admin | Agent |
| --- | :-: | :-: | :-: | :-: | :-: |
| View dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| View reports | ✓ | ✓ | ✓ | | |
| View all leads / PII | ✓ | ✓ | ✓ | | own only |
| Edit lead | ✓ | ✓ | ✓ | | own only |
| Assign lead | ✓ | ✓ | ✓ | | |
| Export leads | ✓ | ✓ | | | |
| Delete lead | ✓ | | | | |
| Manage campaigns and content | ✓ | ✓ | ✓ | | |
| Approve Tier 1 / Tier 2 / Tier 3 | ✓ / ✓ / ✓ | ✓ / ✓ / | ✓ / / | | |
| Manage integrations, run sync | ✓ | sync | sync | ✓ | |
| View audit, system health | ✓ | audit | | ✓ | |
| Create API keys, change roles | ✓ | | | | |

IT keeps the platform running but does not read customer data, export, approve, create keys or change roles. Key and role changes are Owner-only; IT prepares them and the Owner executes.

`assertSeats(users)` throws if a second Agent is active, if any other role appears, or if one person holds two seats.

## Mapping to SWK OS roles

`node engine/cli.mjs roles` prints these definitions.

| Growth | SWK OS role | Permissions |
| --- | --- | --- |
| Owner | `Admin` (existing) | all |
| Manager | `Manager` (existing) | all modules |
| BDM | `Growth BDM` | dashboard view; crm view/create/edit; sales view/create/edit; reports view; projects view/create/edit; documents view; masters view |
| IT Admin | `Growth IT` | dashboard view; **admin view only**; masters view |
| Agent | `Growth Agent` | dashboard view; crm view/create/edit; documents view; masters view |
| (service) | `Growth Sync` | crm view/create/edit |

## Verified behaviour on a local SWK OS

| Role | List leads | Export | Delete | Create API key | List users |
| --- | --- | --- | --- | --- | --- |
| Growth Agent | 200 | 403 | 403 | 403 | 403 |
| Growth IT | **403** | 403 | 403 | 403 | 200 |
| Growth BDM | 200 | 403 | 403 | 403 | 403 |
| Growth Sync (API key) | 200 | 403 | 403 | 403 | 403 |

## Gaps in SWK OS you need to know about

1. **No row-level scoping for staff.** Staff roles see every record in a module. The Growth Agent can list **all** CRM leads, not only those assigned to them (confirmed: they saw a lead owned by Admin). The Growth workspace and the engine only hand the agent their own leads, but SWK OS itself does not enforce it. Until OS adds owner scoping (change request 3 in `docs/OS-INTEGRATION.md`), treat the Agent seat as a trusted person, or keep the Agent out of SWK OS and give them only the Growth workspace.
2. **Privilege escalation through API keys (confirmed, high severity).** In SWK OS, any role with write access on the `admin` module can create an API key that **acts as any user**, including Admin. We tested it: a user with `admin: view, create, edit` created a key acting as the Admin user and exported all leads with it. The first role design gave IT that access; it was changed. `Growth IT` has `admin: view` only, and `tests/growth.test.mjs` fails if any Growth role gets `admin` write, export or delete. Apply the same check to every existing OS role, in particular any role used by third parties.
3. **IT can list staff.** `admin: view` exposes the user list (names and e-mails) to IT. Acceptable for a platform admin; revoke if not wanted.
4. **Default credentials are published.** The OS README and `.env.example` list default admin/manager passwords. OS forces a change at first sign-in, but confirm on production that these accounts do not still use them, and that `ADMIN_PASSWORD` and `MANAGER_PASSWORD` were overridden before first start.

## Browser demo is not security

The role selector in the Growth workspace is a preview of the policy. Real enforcement is the SWK OS server and the engine's signed endpoints. Keep this repository private; it contains strategy, and the sync runs server-side so no key ever reaches a browser.
