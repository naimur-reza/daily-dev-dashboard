# Dev Daily Dashboard

Your personal developer productivity cockpit. Built with Next.js 15, Supabase, and deployed on Vercel.

## Features

- **GitHub integration** — live commit count and open PRs
- **Pomodoro timer** — focus sessions with auto-logging
- **Task tracker** — today's tasks with done/pending state
- **Coding streak** — 28-day heatmap + streak counter
- **Daily challenge** — LeetCode problem of the day
- **Weather widget** — current weather for your city
- **Dev quote** — daily rotating quote
- **Standup journal** — built / blocked / next — auto-saved
- **AI weekly summary** — Claude summarizes your week's journal

## Tech Stack

| Layer      | Tech                       |
| ---------- | -------------------------- |
| Framework  | Next.js 16 (App Router)    |
| Database   | Supabase (Postgres + Auth) |
| Styling    | Tailwind CSS v4            |
| Hosting    | Vercel                     |
| AI summary | Anthropic Claude API       |
| Weather    | OpenWeatherMap API (free)  |

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd dev-daily-dashboard
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. In the SQL editor, paste and run `supabase-schema.sql`
3. Go to **Authentication → URL Configuration** and add `http://localhost:3000` as a redirect URL

### 3. Get your API keys

| Key                             | Where to get it                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Settings → API                                                                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase → Settings → API                                                                     |
| `GITHUB_TOKEN`                  | GitHub → Settings → Developer settings → Personal access tokens (scopes: `repo`, `read:user`) |
| `GITHUB_USERNAME`               | Your GitHub username                                                                          |
| `NEXT_PUBLIC_WEATHER_API_KEY`   | [openweathermap.org](https://openweathermap.org/api) → free tier                              |
| `NEXT_PUBLIC_WEATHER_CITY`      | Your city name e.g. `Dhaka`                                                                   |
| `ANTHROPIC_API_KEY`             | [console.anthropic.com](https://console.anthropic.com)                                        |

### 4. Set up environment

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

You'll be redirected to `/login`. Enter your email → click the magic link → you're in.

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add all your `.env.local` variables in the Vercel dashboard under **Settings → Environment Variables**.

The `vercel.json` includes a cron that triggers the AI weekly summary every Monday at 9am UTC.

## Project Structure

```
dev-daily-dashboard/
├── app/
│   ├── api/
│   │   ├── tasks/route.ts
│   │   ├── journal/route.ts
│   │   ├── habits/route.ts
│   │   ├── pomodoro/route.ts
│   │   ├── github/route.ts
│   │   └── weekly-summary/route.ts
│   ├── dashboard/
│   │   ├── journal/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/dashboard/
│   ├── Sidebar.tsx
│   ├── StatsRow.tsx
│   ├── TasksWidget.tsx
│   ├── PomodoroWidget.tsx
│   ├── PRsWidget.tsx
│   ├── StreakWidget.tsx
│   ├── ChallengeWidget.tsx
│   ├── WeatherWidget.tsx
│   ├── QuoteWidget.tsx
│   ├── JournalWidget.tsx
│   └── WeeklySummaryButton.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/middleware.ts
│   ├── github.ts
│   ├── weather.ts
│   ├── challenges.ts
│   └── quotes.ts
├── types/index.ts
├── proxy.ts
├── supabase-schema.sql
└── vercel.json
```

## Hosting options

| Option                 | Cost    | Best for                   |
| ---------------------- | ------- | -------------------------- |
| Vercel + Supabase free | $0      | This project — perfect fit |
| Vercel Pro + Supabase  | ~$25/mo | More cron jobs, bigger DB  |
| VPS (Hetzner CAX11)    | ~$4/mo  | Full control, self-hosted  |

## License

MIT
