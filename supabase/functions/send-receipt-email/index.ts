/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

type Json = Record<string, unknown>;

function json(status: number, body: Json, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function corsHeaders(origin: string | null) {
  const configured = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Defaults for dev + your Vercel domain.
  const allowed = configured.length
    ? configured
    : ["http://localhost:5173", "https://myfoodapp-pi.vercel.app"];

  const ok = origin && allowed.includes(origin);
  return {
    "access-control-allow-origin": ok ? origin : "null",
    "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS",
    "vary": "origin",
  };
}

function isValidEmail(email: string) {
  // Simple sanity check; keep strict validation on provider side.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" }, cors);
  }

  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM"); // e.g. "Basit's Cafe <receipts@basitscafe.com>"
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendKey) return json(500, { error: "Missing RESEND_API_KEY" }, cors);
    if (!resendFrom) return json(500, { error: "Missing RESEND_FROM" }, cors);
    if (!supabaseUrl) return json(500, { error: "Missing SUPABASE_URL" }, cors);
    if (!serviceRole) return json(500, { error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, cors);

    const body = await req.json().catch(() => null) as Json | null;
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const orderId = typeof body?.order_id === "string" ? body.order_id.trim() : "";

    if (!isValidEmail(email)) return json(400, { error: "Invalid email" }, cors);
    if (!orderId) return json(400, { error: "Missing order_id" }, cors);

    const sb = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    // Fetch the real order from DB so the client can't forge totals/items.
    const { data: order, error } = await sb
      .from("myfoodapp")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return json(500, { error: `DB error: ${error.message}` }, cors);
    if (!order) return json(404, { error: "Order not found" }, cors);

    const items = Array.isArray(order.items) ? order.items : [];
    const created = order.created_at ? new Date(order.created_at) : new Date();

    const receiptRows = items
      .map((it: any) => {
        const qty = Number(it?.qty ?? 0) || 0;
        const name = escapeHtml(String(it?.name ?? ""));
        const custom = escapeHtml(String(it?.customLabel ?? ""));
        const total = Number(it?.totalPrice ?? 0) || 0;
        return `
          <tr>
            <td style="padding:8px 0; font-weight:700; color:#111; width:52px;">${String(qty).padStart(2, "0")}</td>
            <td style="padding:8px 0;">
              <div style="font-weight:800; letter-spacing:0.6px; text-transform:uppercase; color:#111;">${name}</div>
              <div style="font-size:12px; text-transform:uppercase; letter-spacing:0.6px; color:#999; margin-top:2px;">${custom}</div>
            </td>
            <td style="padding:8px 0; font-weight:800; color:#111; text-align:right; width:90px;">${formatMoney(total)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#f6f6f6; padding:24px;">
        <div style="max-width:620px; margin:0 auto; background:#fff; border:1px solid #eee; border-radius:14px; overflow:hidden;">
          <div style="padding:22px 22px 14px; background:linear-gradient(160deg,#1B3320 0%,#0f1f12 100%); color:#fff;">
            <div style="font-size:22px; letter-spacing:2px; font-weight:900; text-transform:uppercase;">Basit's Cafe</div>
            <div style="opacity:0.75; text-transform:uppercase; letter-spacing:1.4px; font-size:12px; margin-top:6px;">
              Receipt copy for your order
            </div>
          </div>

          <div style="padding:18px 22px 6px;">
            <div style="display:flex; justify-content:space-between; gap:12px; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#666;">
              <div>Order ID: <span style="font-weight:900; color:#111;">${escapeHtml(String(order.order_id ?? ""))}</span></div>
              <div>Queue: <span style="font-weight:900; color:#111;">#${String(order.queue_number ?? 0).padStart(3, "0")}</span></div>
            </div>
            <div style="margin-top:8px; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#666;">
              Date: <span style="font-weight:900; color:#111;">${created.toLocaleString("en-US", { weekday: "short", year: "numeric", month: "short", day: "2-digit", hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()}</span>
            </div>
          </div>

          <div style="padding:0 22px 18px;">
            <div style="border-top:1px dashed #ddd; margin:14px 0;"></div>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#999;">
                  <th align="left" style="padding:8px 0; width:52px;">Qty</th>
                  <th align="left" style="padding:8px 0;">Item</th>
                  <th align="right" style="padding:8px 0; width:90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${receiptRows || `<tr><td colspan="3" style="padding:18px 0; color:#999; text-align:center;">No items</td></tr>`}
              </tbody>
            </table>
            <div style="border-top:1px dashed #ddd; margin:14px 0;"></div>

            <div style="display:flex; justify-content:space-between; align-items:flex-end;">
              <div style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#666; font-weight:900;">Total Payment</div>
              <div style="font-size:28px; letter-spacing:1px; font-weight:900; color:#111;">${formatMoney(Number(order.total ?? 0) || 0)}</div>
            </div>

            <div style="margin-top:16px; font-size:11px; text-transform:uppercase; letter-spacing:1.4px; color:#bbb; text-align:center;">
              Thank you. Enjoy your meal.
            </div>
          </div>
        </div>
      </div>
    `;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "authorization": `Bearer ${resendKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [email],
        subject: `Your receipt from Basit's Cafe (#${String(order.queue_number ?? "").toString().padStart(3, "0")})`,
        html,
      }),
    });

    if (!resendResp.ok) {
      const text = await resendResp.text().catch(() => "");
      return json(502, { error: "Email provider error", detail: text.slice(0, 500) }, cors);
    }

    return json(200, { ok: true }, cors);
  } catch (e) {
    return json(500, { error: e?.message || "Unexpected error" }, cors);
  }
});

