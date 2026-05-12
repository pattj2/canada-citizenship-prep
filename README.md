# 🍁 Canada Citizenship Prep

> A full-stack, containerized PWA to help you prepare for the Canadian citizenship test — using **only** the official [Discover Canada](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html) study guide.

## Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

### One-command setup

```bash
cd citi-study-app
docker compose up --build
```

That's it. On first run, Docker will:
1. Build the Next.js app image
2. Start PostgreSQL, Redis, and Adminer
3. Apply Prisma schema (uses migrations when present, otherwise `prisma db push`)
4. Seed 153+ questions from the Discover Canada guide
5. Start the dev server with hot-reload

**Open [http://localhost:3000](http://localhost:3000)** in your browser.

## Current Status (May 2026)

Interactive smoke test (run against local Docker stack) results:

### Working
- Landing page loads and navigation works
- Username sign-in works
- Guest sign-in works (including `Try as Guest` flow)
- Dashboard loads after sign-in
- Study mode navigation works (Practice, Exam, Flashcard, Learn)
- Practice mode answer submission works
- Exam mode answer submission works
- Flashcard reveal works and now shows answer text
- Protected routes are enforced (auth middleware)

### Known Issues
- `GET /icons/icon-192.png` returns `404` because icon assets are not present yet
- Next.js logs a deprecation warning for middleware file convention (`middleware` -> `proxy` in newer Next.js)

## Service URLs

| Service   | URL                            | Notes                          |
|-----------|--------------------------------|--------------------------------|
| App       | http://localhost:3000          | Next.js app (hot-reload)       |
| Adminer   | http://localhost:8080          | DB browser (system: PostgreSQL, server: postgres, user: postgres, pass: postgres) |
| Postgres  | localhost:5432                 | Exposed for local tooling      |
| Redis     | localhost:6379                 | Optional — rate limiting       |

## Database Persistence

PostgreSQL data is persistent by default through a Docker named volume.

Important for Windows + WSL users:
- If this project runs from a Windows-mounted path (for example `/mnt/c/...`), keep the named Docker volume for Postgres data.
- Bind-mounting Postgres data to a folder under `/mnt/c/...` can fail because PostgreSQL needs Linux `chmod/chown` behavior that NTFS mounts do not reliably provide.

### Recommended (works on `/mnt/c/...`)
- Keep this in [docker-compose.yml](docker-compose.yml):
  - `postgres_data:/var/lib/postgresql/data`
- This is still persistent across container restarts and rebuilds.

### Project-folder persistence (only when project is on WSL native filesystem)
If your repo is under a Linux path like `/home/<user>/citi-study-app`, you can persist DB files in-project:

1. Create directory: `data/postgres`
2. Change [docker-compose.yml](docker-compose.yml) Postgres volume mount to:
	- `./data/postgres:/var/lib/postgresql/data`
3. Recreate containers:
	- `docker compose down -v`
	- `docker compose up -d --build`

If Postgres shows unhealthy with permission errors such as `Operation not permitted`, switch back to the named volume.

## Admin Access

Set `ADMIN_USERNAME` in `.env` before first run:

```env
ADMIN_USERNAME=myadmin
```

Log in with that username — you'll automatically get the admin role and see the `/admin` panel.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable             | Default                                      | Description                         |
|----------------------|----------------------------------------------|-------------------------------------|
| `DATABASE_URL`       | `postgresql://postgres:postgres@postgres:5432/citi_study` | Postgres connection string |
| `NEXTAUTH_URL`       | `http://localhost:3000`                      | App base URL                        |
| `NEXTAUTH_SECRET`    | *(generate one)*                             | JWT signing secret                  |
| `ADMIN_USERNAME`     | `admin`                                      | Username that gets admin role       |
| `REDIS_URL`          | `redis://redis:6379`                         | Optional — rate limiting            |

Generate a secret:
```bash
openssl rand -base64 32
```

## Study Modes

| Mode             | Description                                              |
|------------------|----------------------------------------------------------|
| **Practice**     | Topic-filtered, 10 questions, instant feedback           |
| **Exam Simulator** | 20 questions, 45-minute timer, pass at 75% (15/20)    |
| **Flashcards**   | Flip-card review of key facts by topic                   |
| **Learn**        | Chapter links to the official guide + practice shortcuts |

## Project Structure

```
citi-study-app/
├── src/
│   ├── app/           # Next.js App Router pages & API routes
│   ├── components/    # Shared UI components
│   │   ├── layout/    # Header, Footer
│   │   └── ui/        # QuestionCard, Timer, ProgressBar, etc.
│   ├── lib/           # Auth, quiz logic, rate limiting, Prisma client
│   ├── stores/        # Zustand state (auth, quiz, progress)
│   └── middleware.ts  # Route protection
├── prisma/
│   ├── schema.prisma  # Full DB schema
│   └── seed.ts        # 153+ questions from Discover Canada
├── scripts/
│   └── entrypoint.sh  # Container startup script
├── tests/
│   ├── unit/          # Jest unit tests
│   └── e2e/           # Playwright end-to-end tests
├── public/
│   └── manifest.json  # PWA manifest
├── Dockerfile
└── docker-compose.yml
```

## Running Tests

```bash
# Unit tests (inside container or with local Node)
npm test

# E2E tests (requires app to be running)
npx playwright test
```

## Stopping

```bash
docker compose down        # stop containers
docker compose down -v     # stop + remove volumes (clears DB)
```

## Technology Stack

- **Next.js 16** (App Router)
- **NextAuth.js v4** — username-only, no email/password
- **Prisma + PostgreSQL 16** — full ORM with migrations
- **Tailwind CSS** — custom Canadian red theme, dark mode
- **Zustand** — client state management
- **Web App Manifest** for installable PWA metadata
- **Docker Compose** — 4-service local stack

## Content Disclaimer

All study content is sourced exclusively from the official Government of Canada publication [Discover Canada: The Rights and Responsibilities of Citizenship](https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/discover-canada.html). This is an **unofficial** study tool and is not affiliated with or endorsed by the Government of Canada.
