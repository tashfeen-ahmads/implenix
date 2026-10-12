# Built-in email verifier

Checks whether each mailbox exists before you email it, the same way
MillionVerifier and ZeroBounce do, without a paid subscription. The only
cost is a small server.

## How it works

For each address:

1. **Free checks (always on, in the dashboard):**
   - syntax;
   - disposable domains;
   - addresses that must never get mail (abuse@, noreply@…);
   - whether the domain has mail servers (MX).
2. **Mailbox check (the built-in verifier):**
   1. The verifier connects to the domain's mail server on port 25.
   2. It says hello (`EHLO`), gives a sender (`MAIL FROM`) and asks
      whether it can deliver to the address (`RCPT TO`).
   3. It hangs up before sending anything. **No email is ever sent.**
3. **Catch-all check:** in the same conversation it asks about a random
   address at that domain. If that is also accepted, the domain accepts
   everything, so the answer means nothing. The address is marked
   **Catch-all**, and that answer is remembered for the domain for an
   hour.

| Mail server answers | Result | Emailed? |
|---|---|---|
| 250 for the address, rejects the random one | **Verified** | Yes |
| 250 for both | **Catch-all** | Only if the campaign allows catch-all |
| 550 "user unknown" / "does not exist" / 5.1.1 | **Undeliverable** | Never |
| 552 mailbox full | Catch-all/risky | Only if allowed |
| 4xx (greylisting, try later), timeouts | Unconfirmed | Yes |
| Refusal about *us* (blocklist, reputation, 5.7.x policy) | Unconfirmed | Yes |

A refusal about our server is never counted against the address. If your
verifier's IP gets blocked by a provider, results for that provider fall
back to "Unconfirmed". That is the same as having no verifier, not wrong.

Code:
- `lib/leads/smtpProbe.ts`: the check itself.
- `scripts/verifier/server.ts`: the small HTTP service.
- `lib/leads/verify.ts`: the `builtin` provider.

## Why it needs its own small server

The check talks to mail servers on **port 25**. Vercel (where the
dashboard runs) blocks outbound port 25. So do AWS Lambda, EC2 and Oracle
Cloud by default, until you ask them to open it. So the verifier runs as a
tiny service on a Linux server where port 25 is open. The dashboard calls
it over HTTPS with a shared secret.

This server is **not** your sending server. SES keeps sending the email,
and nothing the verifier does touches the SES account or its reputation.

## Where to run it

You only need the smallest server: 1 vCPU, 0.5-1 GB RAM. Pick one where
outbound port 25 can be opened. Prices and policies were checked in
October 2026; confirm them before you sign up.

**AWS EC2 (you already have the account for SES)**
- **Free plan:** AWS accounts opened since 15 July 2025 get $100-$200 of
  credits for 6 months, and a `t4g.micro` instance is eligible. After
  that, a `t4g.nano` costs a few dollars a month, plus about $3.60 a month
  for the public IPv4 address.
- **Opening port 25:**
  1. Allocate an **Elastic IP** and attach it to the instance.
  2. Sign in as the account owner and submit **"Request to remove email
     sending limitations"** (AWS Support > the port 25 / rDNS form). Ask
     for reverse DNS on the Elastic IP (e.g. `verify.implenix.net`) in the
     same request.
  3. Describe the use honestly: verifying B2B addresses before sending
     through SES, low volume, no mail sent from the instance.
- AWS can decline. If it does, use another provider.

**Hetzner Cloud**
- Roughly €4 a month for the smallest server.
- New accounts have port 25 blocked. You can ask support to unblock it
  once your first invoice is paid.
- Set reverse DNS in the Hetzner console.

**Oracle Cloud Always Free**
- Free.
- Port 25 is blocked for tenancies created since June 2021. You must
  request an exemption through a service-limit request, and approval is
  not guaranteed.

**Your own computer**: most home internet providers block port 25. To
test, run `nc -vz gmail-smtp-in.l.google.com 25`. If it times out, that
connection won't work.

## Setup (about 30 minutes)

1. **DNS** (at your domain registrar):
   - Add an `A` record `verify.implenix.net` pointing to the server's IP.
2. **Reverse DNS:** set the server IP's reverse DNS (PTR) to
   `verify.implenix.net`, through AWS, Hetzner or Oracle as described
   above. Mail servers often refuse to talk to an IP without matching
   reverse DNS.
3. **On the server** (Ubuntu 24.04):
   ```
   sudo apt update && sudo apt install -y git nodejs npm caddy
   sudo useradd -r -s /usr/sbin/nologin verifier
   sudo git clone <this repository> /opt/implenix && cd /opt/implenix && sudo npm ci
   sudo cp scripts/verifier/verifier.env.example /etc/implenix-verifier.env
   sudo chmod 600 /etc/implenix-verifier.env && sudo nano /etc/implenix-verifier.env
   sudo cp scripts/verifier/implenix-verifier.service /etc/systemd/system/
   sudo systemctl daemon-reload && sudo systemctl enable --now implenix-verifier
   sudo cp scripts/verifier/Caddyfile /etc/caddy/Caddyfile   # edit the host name
   sudo systemctl reload caddy
   ```
   - Node 20 or newer is needed. If Ubuntu's package is older, install
     Node from nodesource.
   - Fill in the env file: `VERIFIER_SECRET` (`openssl rand -hex 32`),
     `VERIFIER_HELO_HOST=verify.implenix.net` and
     `VERIFIER_MAIL_FROM=check@verify.implenix.net`.
4. **Firewall:** allow inbound 80 and 443 (for Caddy and HTTPS). The
   service itself listens only on 127.0.0.1.
5. **Check the server:**
   - `curl https://verify.implenix.net/health` should return
     `{"ok":true}`.
   - `nc -vz gmail-smtp-in.l.google.com 25` should connect.
6. **In Vercel** (dashboard environment variables):
   ```
   VERIFIER_URL=https://verify.implenix.net
   VERIFIER_SECRET=<same value as on the server>
   ```
   Redeploy. **Dashboard > Setup** then shows the mailbox verifier as
   connected, and the lead search page says "Mailboxes verified with the
   built-in verifier".

## Running it in the app instead

If the dashboard is ever hosted somewhere with port 25 open (a VPS, not
Vercel), it can run the check in-process:

```
EMAIL_VERIFIER=smtp
VERIFIER_HELO_HOST=...
VERIFIER_MAIL_FROM=...
```

## Limits (true of paid verifiers too)

- **Yahoo and AOL** accept every address at this stage, so their
  addresses show as Catch-all.
- **Microsoft 365** usually answers correctly ("5.4.1 Recipient address
  rejected" means no mailbox). Some tenants accept everything and show as
  Catch-all.
- **Gmail and Google Workspace** answer reliably.
- **Keep volume modest from one IP:** a few thousand checks a day at
  most. The service allows 5 checks at once and 2 per mail server. Very
  high volume can get the verifier's IP on a blocklist. Results then
  become "Unconfirmed", and SES is unaffected.
- Paid verifiers add many IPs and historical data. This is the same core
  technique without those.
