/**
 * Cloudflare Worker — secure proxy for the portfolio AI assistant.
 *
 * The static site (GitHub Pages) calls THIS worker, never a model API directly.
 * The API key lives only here, as a secret, so it is never exposed to the
 * browser. This also sidesteps browser CORS limits, since the upstream call
 * happens server-side.
 *
 * The worker is provider-aware. The frontend always sends the same neutral
 * shape ({ messages: [{ role: "user"|"assistant", content }] }) and gets back
 * { reply }. Switching providers is a config change, no frontend edits.
 *
 *   Browser --{messages}--> Worker --> Gemini  OR  Anthropic
 *           <-- {reply} ---
 *
 * Configuration
 *   PROVIDER          var     "gemini" (default) or "anthropic"
 *   MODEL             var     model id (defaults per provider, see below)
 *   ALLOWED_ORIGIN    var     e.g. "https://maltesehkr.github.io"
 *   SYSTEM_PROMPT     var     optional persona override
 *   GEMINI_API_KEY    secret  required when PROVIDER=gemini
 *   ANTHROPIC_API_KEY secret  required when PROVIDER=anthropic
 *   RATE_LIMIT        KV      optional, enables per-IP rate limiting
 */

const DEFAULT_PROVIDER = "gemini";
const DEFAULT_MODELS = {
  gemini: "gemini-2.5-flash", // free tier; use gemini-2.5-flash-lite for higher quota
  anthropic: "claude-haiku-4-5-20251001",
};
const DEFAULT_SYSTEM =
  "You are a helpful AI assistant embedded in Michael's software-development portfolio website. " +
  "Be concise, friendly and technically accurate. You can discuss his skills (C#/.NET, Python, " +
  "JavaScript, Flutter and cybersecurity) and help visitors with general programming questions. " +
  "Keep answers short unless the visitor asks for more detail.";

const MAX_TOKENS = 1024;
const MAX_MESSAGES = 20;
const MAX_CHARS = 8000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60; // seconds

function corsHeaders(allowed) {
  const h = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (allowed && allowed !== "*") {
    h["Access-Control-Allow-Origin"] = allowed;
    h["Vary"] = "Origin";
  } else {
    h["Access-Control-Allow-Origin"] = "*";
  }
  return h;
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

// -- Provider adapters -------------------------------------------------
// Each takes the neutral { system, messages } and returns
// { ok, status, reply, detail }.

async function callGemini(env, model, system, messages) {
  const key = env.GEMINI_API_KEY;
  if (!key) return { ok: false, status: 500, detail: "missing_key" };

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.7 },
  };

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(model) +
    ":generateContent";

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 502, detail: "upstream_unreachable" };
  }

  if (!res.ok) {
    let detail = "";
    try {
      const e = await res.json();
      detail = (e && e.error && e.error.status) || "";
    } catch {}
    return { ok: false, status: res.status === 429 ? 429 : 502, detail };
  }

  const data = await res.json();
  const cand = data.candidates && data.candidates[0];
  const reply =
    cand && cand.content && Array.isArray(cand.content.parts)
      ? cand.content.parts.map((p) => p.text || "").join("").trim()
      : "";

  if (!reply) {
    const blocked =
      (data.promptFeedback && data.promptFeedback.blockReason) ||
      (cand && cand.finishReason) ||
      "empty_response";
    return { ok: false, status: 502, detail: String(blocked) };
  }
  return { ok: true, status: 200, reply };
}

async function callAnthropic(env, model, system, messages) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, status: 500, detail: "missing_key" };

  const body = { model, max_tokens: MAX_TOKENS, system, messages };

  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, status: 502, detail: "upstream_unreachable" };
  }

  if (!res.ok) {
    let detail = "";
    try {
      const e = await res.json();
      detail = (e && e.error && e.error.type) || "";
    } catch {}
    return { ok: false, status: res.status === 429 ? 429 : 502, detail };
  }

  const data = await res.json();
  const reply = Array.isArray(data.content)
    ? data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim()
    : "";
  if (!reply) return { ok: false, status: 502, detail: "empty_response" };
  return { ok: true, status: 200, reply };
}

const PROVIDERS = { gemini: callGemini, anthropic: callAnthropic };

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";
    const cors = corsHeaders(allowed);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    if (allowed !== "*") {
      const origin = request.headers.get("Origin");
      if (origin && origin !== allowed) {
        return json({ error: "Forbidden origin" }, 403, cors);
      }
    }

    const provider = (env.PROVIDER || DEFAULT_PROVIDER).toLowerCase();
    const callProvider = PROVIDERS[provider];
    if (!callProvider) {
      return json({ error: "Unknown provider" }, 500, cors);
    }

    if (env.RATE_LIMIT) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const key = `rl:${ip}`;
      const current = parseInt((await env.RATE_LIMIT.get(key)) || "0", 10);
      if (current >= RATE_LIMIT_MAX) {
        return json({ error: "Rate limit exceeded. Please slow down." }, 429, cors);
      }
      await env.RATE_LIMIT.put(key, String(current + 1), {
        expirationTtl: RATE_LIMIT_WINDOW,
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, cors);
    }

    let messages = Array.isArray(payload.messages) ? payload.messages : null;
    if (!messages || messages.length === 0) {
      return json({ error: "A non-empty messages array is required" }, 400, cors);
    }

    messages = messages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-MAX_MESSAGES)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

    if (messages.length === 0) {
      return json({ error: "No valid messages" }, 400, cors);
    }

    while (
      messages.length > 1 &&
      messages.reduce((n, m) => n + m.content.length, 0) > MAX_CHARS
    ) {
      messages.shift();
    }

    const model = env.MODEL || DEFAULT_MODELS[provider];
    const system = env.SYSTEM_PROMPT || DEFAULT_SYSTEM;

    const result = await callProvider(env, model, system, messages);
    if (!result.ok) {
      if (result.detail === "missing_key") {
        return json({ error: "Server not configured" }, 500, cors);
      }
      return json(
        { error: "Assistant unavailable", detail: result.detail || "" },
        result.status || 502,
        cors
      );
    }
    return json({ reply: result.reply }, 200, cors);
  },
};
