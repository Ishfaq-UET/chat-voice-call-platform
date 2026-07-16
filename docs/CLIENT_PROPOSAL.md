# Chat, Voice & Call Platform — Client Proposal Summary

## Project overview

- A website where men can chat, send voice messages, and make voice calls with women
- Men pay for each chat or call
- The platform keeps a commission from every payment
- Women earn money into a wallet and can withdraw
- Women must complete face verification before going live
- Includes an admin dashboard to manage users, verification, payments, and withdrawals
- Built as a simple web app (works on phone and computer browsers)
- Target launch: about **5–6 weeks**

---

## Roles & core flows

**Male**
- Sign up / login
- See list of women with chat and call prices
- Add money to wallet
- Chat, send voice messages, or call
- Pay from wallet for each message or call minute

**Female**
- Sign up / login
- Complete face verification (selfie review by admin)
- Set chat and call prices
- Receive chats and calls
- Earn money in wallet (after platform commission)
- Request withdrawal

**Admin**
- Approve or reject face verification
- Manage users
- Set commission percentage
- Approve withdrawals
- View basic reports (earnings, users, calls)

**Simple money flow**
- Male pays → Platform takes commission → Rest goes to female wallet → Female requests withdrawal → Admin pays out

---

## Recommended tech stack

- Website & admin panel
- Real-time chat
- Voice messages storage
- Voice calling
- Push / alerts
- Male payments (wallet top-up)
- Female withdrawals (manual payout in first version)
- Face verification (selfie + admin approval)
- Hosting / server

---

## Functional requirements

- User registration & login (male / female)
- User profiles
- Female face verification
- Male home page (women list with prices)
- Female pricing setup (chat / voice / call)
- Male wallet & top-up
- Female wallet & earnings
- Platform commission
- Live chat
- Voice messages
- Voice calling
- Call billing (per minute)
- Withdrawal requests
- Admin dashboard
- Notifications
- Basic reports

---

## Delivery phases & timeline

| Phase | Time | What you get |
|-------|------|--------------|
| **Phase 1 — Foundation** | Week 1–1.5 | Sign up, profiles, admin panel, face verification |
| **Phase 2 — Wallet & listing** | Week 2–2.5 | Wallets, commission, male top-up, women listing with prices |
| **Phase 3 — Chat & voice notes** | Week 3–3.5 | Live chat, voice messages, payment on messages |
| **Phase 4 — Voice calls** | Week 4 | Voice calling with per-minute billing |
| **Phase 5 — Withdrawals & polish** | Week 4.5–5 | Withdrawals, reports, notifications, testing |
| **Final testing & go-live** | ~0.5–1 week | Client testing, fixes, live launch |

**Total: about 5–6 weeks**

---

## Cost expectations (approximate)

| Item | MVP cost |
|------|----------|
| Server (VPS) | ~$10–40 / month |
| Domain + SSL | Low / free SSL |
| Chat (Reverb) | Included on same server |
| File storage | Free tier usually enough early |
| Voice calling (Agora) | Free quota, then pay-per-minute |
| Payment gateway fees | Standard % per top-up |

No separate mobile app cost in this first version.

---

## What we need from you

- Brand name, logo, colors, domain
- Payment gateway account + keys
- Agora account for voice calls
- Preferred hosting / server
- Commission % and minimum withdrawal amount
- Terms, privacy, age 18+ policy
- How female payouts will be paid (bank transfer process)

---

## Recommendation

Ship a lean web MVP in **5–6 weeks** with manual face verification, live chat, voice calls, and admin-managed withdrawals. This keeps cost low and delivery fast, with a clear path to automate more later.
