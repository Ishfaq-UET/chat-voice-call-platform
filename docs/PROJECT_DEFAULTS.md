# Project defaults (confirmed for MVP)

These defaults are used for the first build so work can start without waiting on every client decision. They can be changed later in the admin panel or `.env`.

| Setting | Default | Notes |
|---------|---------|--------|
| Payment gateway | **Stripe** | Male wallet top-ups. Switchable to a local gateway later if needed. |
| Platform commission | **20%** | Configurable in Admin → Settings |
| Minimum withdrawal | **$20** | Configurable in Admin → Settings |
| Face verification | Manual selfie + admin approve/reject | No paid AI API in MVP |
| Voice calling | Agora Voice | Requires client Agora App ID + certificate in `.env` |
| Female payouts | Manual (admin marks paid after bank transfer) | No automatic payout API in MVP |
| Currency | USD | Display / storage unit |

### Stripe keys (client must provide)

```
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=
```

### Agora keys (client must provide)

```
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=
```
