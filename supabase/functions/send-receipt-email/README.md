# send-receipt-email

Supabase Edge Function that emails an order receipt via Resend.

## Required Secrets (Supabase)

- `RESEND_API_KEY`
- `RESEND_FROM`
  - Example: `Basit's Cafe <receipts@basitscafe.com>`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional: `ALLOWED_ORIGINS`
  - Comma-separated, no trailing slashes.
  - Example: `https://myfoodapp-pi.vercel.app,http://localhost:5173`

## Request Body

```json
{
  "email": "customer@example.com",
  "order_id": "12345678901"
}
```

The function fetches the order from the `myfoodapp` table using `order_id`.

