# Chat, Voice & Call Platform

Commission-based chat, voice notes, and voice calling web app with male/female roles, face verification, wallets, and an admin dashboard.

## Stack

- Laravel + Inertia + React + Tailwind
- Laravel Reverb (realtime chat / call signaling)
- Stripe (wallet top-up; demo top-up if keys missing)
- Agora Voice (calls; UI works without keys)

## Quick start

```bash
composer install
cp .env.example .env   # if needed
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan db:seed --class=WorldSeeder   # if countries table is empty
php artisan storage:link
npm install --legacy-peer-deps
npm run build
php artisan serve
# In another terminal:
php artisan reverb:start
```

## Demo accounts (password: `password`)

| Role   | Email              |
|--------|--------------------|
| Admin  | admin@example.com  |
| Male   | male@example.com   |
| Female | female@example.com |

## Client docs

- [Client proposal](docs/CLIENT_PROPOSAL.md)
- [Project defaults](docs/PROJECT_DEFAULTS.md) (Stripe, 20% commission)
