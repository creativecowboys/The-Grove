# Grove leads workspace

Status: production launch authorized September 16. Implementation is in an isolated branch; Twilio production credentials are provisioned with SMS disabled. Deployment is not yet complete.

## What it does

- `/leads` is a private card view of website opportunities in the existing Grove GHL pipeline. It refreshes once a minute and paginates older records. Contact names, email, phone, event title, source, creation date and pipeline stage are shown. Detailed inquiry messages remain in GHL contact notes and the existing venue email.
- A server-verified random access code opens an eight-hour HttpOnly session. Both page and data endpoint check the session; missing configuration denies access. Rotating either secret revokes sessions. No lead records are stored in localStorage, public static files, or the repository.
- The existing inquiry handler queues a fixed-message Twilio notification after email or GHL accepts the inquiry. If only email succeeds, the SMS explicitly directs Christy to the venue inbox. Twilio rejection/timeout does not reject an already accepted inquiry. API acceptance does not establish handset delivery.
- Preview deployments never send SMS. SMS is also disabled unless explicitly enabled.

## Required before launch

1. Dave confirms who has access and whether a shared random code is acceptable. Individual accounts are not implemented in this version. Generate `LEADS_ACCESS_CODE` and `LEADS_SESSION_SECRET` independently with `openssl rand -hex 32`; place them in encrypted server-only Vercel variables. Share the access code through the approved password manager.
2. Verify the existing GHL token has `opportunities.readonly` as well as its existing write permissions. Confirm live API response fields and that the configured pipeline contains the site's inquiries. The dashboard never silently substitutes sample data when the provider fails.
3. Verify Christy's destination mobile number, Grove's approved Twilio sender/messaging service, and an API key for the correct account. Set the server variables in `.env.example`. Do not commit credentials or print them to logs.
4. Configure persistent request rate limiting on `/api/inquiry` and sign-in at the hosting edge before enabling paid SMS. The public form currently has no distributed rate limiter or durable submission deduplication; repeat submissions can create repeat cards/texts. Do not represent this integration as exactly-once delivery.
5. Confirm Vercel build settings: the connected project reports framework `vite`, but its current deployed commit is this Next.js repository and its deployment reports Turbopack. Preserve/verify its working build overrides rather than blindly changing them.
6. Test a preview without live SMS. After Dave approves launch and a test recipient, enable production SMS and submit one identifiable test inquiry. Verify the GHL card, existing email, Twilio message status and recipient delivery. Do not send a live test without that authorization.

Existing fallback: email-only success means no card exists when GHL is down. There is no durable retry queue in this implementation. Missed SMS needs operator attention in Twilio/function logs. If guaranteed eventual card creation/notification is required, add a durable outbox before launch.

## Local verification

`node --experimental-strip-types --test tests/leads.test.mjs`

`npm run build`

`npx eslint app/leads app/api/leads app/api/inquiry/route.ts lib/leads-session.ts lib/grove-leads.ts lib/lead-sms.ts components/SiteShell.tsx app/layout.tsx`

The unit checks stub all provider calls: they do not send email, create real leads or text a phone. A complete live acceptance test is still required.

## September 16 mobile and junk-lead update

- Mobile layout tested at 390px and 320px; tap targets at least 44px, no horizontal overflow. Browser verified Delete -> Trash -> Restore with synthetic local provider records.
- Delete moves the scoped GHL website opportunity to `abandoned`; Trash shows abandoned website opportunities. Restore reopens the opportunity. The underlying contact and notes remain intact. This is recoverable removal, not permanent contact erasure. Status changes may trigger existing GHL workflows: inspect live account workflows before launch.
- PATCH verifies authenticated session, same-origin Host, input ID/action, and the opportunity's exact location/pipeline/source before changing status.
- Build, four provider/security tests, changed-file lint pass. No live records modified and no messages sent.
- Text: There's a new lead for The Grove! View the details: https://thegroveatdefoorfarm.com/leads
- Sender 470-243-9358 approved by Dave; recipient saved in private workspace setup file. Twilio sender enabled, brand approved and campaign verified.
- Dedicated restricted key The Grove Lead Alerts created with message-create permission only; six Twilio/SMS production variables saved in Vercel. SMS remains disabled until launch checks complete.
- Claude coordination attempt BURT-20260916-132132 failed due to expired OAuth. Deployment through Burt still blocked. Live GHL credentials/schema, rate limiting, login provisioning, deployment and delivery test remain outstanding.

## September 16 launch checkpoint

Dave authorized the full launch. The existing Claude/Burt desktop session accepted the handoff and corrected the GHL 2021-07-28 search query to `location_id`/`pipeline_id` and the status-response check to accept `succeded: true`. Local regression checks exercise both shapes. Live credentials, provider scopes/workflows and the final form/SMS round trip still need recorded verification.

Claude then stopped with a monthly spending-limit error before deployment. Codex requested permission to publish directly because standing project instructions route publishing through Burt. No deployment or live test is claimed. Remaining launch gates: persistent throttling, login-secret provisioning, live GHL verification, production deployment, one labeled test and verified SMS delivery.

## Production activation

Dave approved direct Codex publication after Claude reached its spending limit. PR #10 is merged; deployment dpl_B2gULwm82XzZNGMSeHGZowJfQaFm is READY at commit 1ef73151ba31ee0c60e4b78ed783761cce517cfa. Production login and real GHL inquiry retrieval verified. Unauthenticated /api/leads returns 401.

Vercel edge rules now limit POST /api/inquiry to 5 requests per minute per IP and POST /leads to 10 per minute per IP. Dashboard access/session secrets are provisioned. SMS activation saved in Production settings; this commit applies those settings. Final labeled form, SMS-delivery and recoverable-trash verification follows deployment.

## Access usability update

At Dave’s request, the production access code was rotated to a memorable lowercase passphrase. Keep the value outside git. Existing sessions are revoked when this production setting takes effect. The independent signing secret and request limits remain in place.

## Email-link login

`LEADS_LOGIN_EMAIL` restricts email sign-in to one server-configured address. Requests use the existing Resend sender and a fixed destination URL. Repeated requests in a five-minute bucket share an idempotency key to avoid duplicate emails; the existing POST /leads edge limit also applies. Preview deployments never send login email.

Links are signed, expire 10–15 minutes after requesting, and require a confirmation tap before issuing the existing eight-hour session. They are bearer links reusable until expiration, not single-use tokens; do not forward them. Rotating the signing secret, passphrase, or approved email invalidates pending links. No tokens or recipient addresses are logged by the application. The page sets no-referrer and noindex. The access-code option remains a backup.

Validation: six security/provider tests, targeted lint and production build. Verify live request UI, rejected tampered link, and valid-link session after deploying.
