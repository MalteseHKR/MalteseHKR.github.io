# AI Assistant backend (secure proxy)

The portfolio is a **static** site (GitHub Pages), so it cannot hold an API key —
anything shipped to the browser is public. This small serverless proxy holds the
key server-side and is the only thing that talks to the model API. The frontend
calls the proxy; the proxy calls the model.

```
Browser ──POST {messages}──▶  Worker (holds API key)  ──▶  Gemini / Anthropic
        ◀──── {reply} ───────                          ◀───
```

It also avoids the browser CORS restriction on model APIs, because the upstream
call happens on the server.

The worker is **provider-aware**. The frontend always sends the same neutral
`{ messages: [{ role, content }] }` and receives `{ reply }`, so switching
between Gemini and Anthropic is a config change with **no frontend edits**.

## Use Gemini (free tier — recommended)

1. Get a key at https://aistudio.google.com/apikey (no credit card required).
2. Install the CLI and sign in:
   ```bash
   npm install -g wrangler
   wrangler login
   ```
3. From this `api/` folder, store the key as a secret:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
4. `wrangler.toml` already sets `PROVIDER = "gemini"` and
   `MODEL = "gemini-2.5-flash"`. Set `ALLOWED_ORIGIN` to your site origin.
5. Deploy:
   ```bash
   wrangler deploy
   ```
   Wrangler prints a URL like `https://portfolio-ai-proxy.<you>.workers.dev`.
6. In `../ultimate-ai-assistant.html`, set:
   ```js
   const ASSISTANT_API_URL = "https://portfolio-ai-proxy.<you>.workers.dev";
   ```
   Leave it `""` to keep the page in offline demo mode.

### Gemini free-tier models (Q2 2026)

| Model                   | Rate limit        | Notes                          |
| ----------------------- | ----------------- | ------------------------------ |
| `gemini-2.5-flash`      | 10 req/min, 250/day | Default. Good quality/limit balance |
| `gemini-2.5-flash-lite` | 15 req/min, 1000/day | Highest free quota; lighter answers |
| `gemini-2.5-pro`        | 5 req/min, 100/day | Strongest, tightest limits     |

Change the model by editing `MODEL` in `wrangler.toml` and redeploying.

### Free-tier caveats worth knowing

- **Data use:** on the free tier Google may use prompts/responses to improve its
  models. Don't send anything sensitive. (Paid tier excludes this.)
- **Region/commercial terms:** Google applies extra restrictions to free-tier
  *commercial* use in the EU/EEA/UK/Switzerland. A personal portfolio chat is
  low-risk, but since you're in Malta (EU), skim the current terms at
  https://ai.google.dev/gemini-api/terms before treating it as commercial.
- **429s:** the rate limits are low, so keep the per-IP limiter on (below) and
  the page degrades gracefully to a demo response if a call fails.

## Switch to Anthropic instead

Set `PROVIDER = "anthropic"` and `MODEL = "claude-haiku-4-5-20251001"` in
`wrangler.toml`, then `wrangler secret put ANTHROPIC_API_KEY` and redeploy.
Nothing else changes.

## Optional: rate limiting

```bash
wrangler kv namespace create RATE_LIMIT
```
Paste the returned `id` into the `[[kv_namespaces]]` block in `wrangler.toml`,
uncomment it, and redeploy. Defaults to 20 requests / 60s per IP (tune the
constants at the top of `worker.js`). Recommended given Gemini's low free limits.

## Configuration reference

| Name                | Type   | Purpose                                         |
| ------------------- | ------ | ----------------------------------------------- |
| `PROVIDER`          | var    | `gemini` (default) or `anthropic`               |
| `MODEL`             | var    | Model id (defaults per provider)                |
| `ALLOWED_ORIGIN`    | var    | Restrict which site may call the proxy          |
| `SYSTEM_PROMPT`     | var    | Override the assistant persona                  |
| `GEMINI_API_KEY`    | secret | Required when `PROVIDER=gemini`                 |
| `ANTHROPIC_API_KEY` | secret | Required when `PROVIDER=anthropic`              |
| `RATE_LIMIT`        | KV     | Bind to enable per-IP rate limiting             |

## Alternatives (Vercel / Netlify)

The provider adapters port directly; only the handler signature changes.
- **Vercel:** `api/chat.js` exporting `export default function handler(req, res)`,
  read `process.env.GEMINI_API_KEY`, set it via `vercel env add`.
- **Netlify:** `netlify/functions/chat.js` exporting `export const handler`.

## Security notes

- Keys are Worker **secrets**, never in the repo or the client bundle.
- `ALLOWED_ORIGIN` + CORS limit casual cross-site use.
- Input is capped (message count, total characters) before reaching the model.
- Upstream errors are returned as coarse types only — no internal details leak.
