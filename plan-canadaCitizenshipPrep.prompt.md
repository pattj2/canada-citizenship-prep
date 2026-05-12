## Plan: Canada Citizenship Prep — Full Application

**TL;DR:** Build a containerized, PWA-capable Next.js 14 full-stack app inside `citi-study-app/` that runs entirely with `docker compose up --build`. A single Next.js container handles both frontend and API routes, backed by PostgreSQL + Prisma, with Redis (optional profile) and Adminer for DB inspection. Questions are seeded from the official *Discover Canada* guide's 10 chapters. Auth via NextAuth.js supports email/password, guest mode, and an admin role.

---

### Phase 1 — Project Scaffold & Docker Infrastructure
*All steps can begin in parallel once folder structure is defined.*

1. Create the full folder structure under `citi-study-app/`
2. Write `docker-compose.yml` with 5 services: `app` (Next.js), `postgres`, `redis`, `adminer`, and an `init-db` seed runner
3. Write multi-stage `Dockerfile` for the Next.js app (dev + prod targets)
4. Write `.env.example` with all required variables (DB URL, NextAuth secret, Redis URL, admin credentials)
5. Write `.dockerignore` files
6. Write `scripts/entrypoint.sh` that runs `prisma migrate deploy` → `prisma db seed` → starts the app
7. Write `package.json` workspace scripts (`dev`, `build`, `seed`, `test`)

**Relevant files to create:**
- `citi-study-app/docker-compose.yml`
- `citi-study-app/Dockerfile`
- `citi-study-app/.env.example`
- `citi-study-app/scripts/entrypoint.sh`

---

### Phase 2 — Database Schema (Prisma)
*Depends on Phase 1 scaffold.*

8. Define Prisma schema with these models:
   - `User` (id, username, role: STUDENT|ADMIN, createdAt)
   - `Session` (NextAuth adapter table — username-based)
   - `Topic` (id, name, slug, description) — maps to the 10 guide chapters
   - `Question` (id, topicId, text, type: MCQ|TRUE_FALSE|FILL_BLANK, difficulty: EASY|MEDIUM|HARD, explanation, sourceRef)
   - `Answer` (id, questionId, text, isCorrect)
   - `QuizSession` (id, userId, mode: PRACTICE|EXAM|FLASHCARD|LEARN, startedAt, completedAt, score, passed)
   - `QuizAnswer` (id, sessionId, questionId, selectedAnswerId, isCorrect, timeSpentMs)
   - `Leader` (id, title, name, jurisdiction, updatedAt, updatedBy) — PM, GG, Alberta Premier, Lt. Gov.
   - `Achievement` (id, userId, type, earnedAt)
   - `DailyStreak` (id, userId, currentStreak, longestStreak, lastActiveDate)
9. Write migration files and seed script (`prisma/seed.ts`)

**Relevant files to create:**
- `citi-study-app/prisma/schema.prisma`
- `citi-study-app/prisma/migrations/`
- `citi-study-app/prisma/seed.ts`

---

### Phase 3 — Seed Data (Questions from Official Guide)
*Depends on Phase 2 schema.*

10. Seed 10 `Topic` records matching the guide chapters:
    - Rights & Responsibilities, Who We Are, Canada's History, Modern Canada, How Canadians Govern Themselves, Federal Elections, The Justice System, Canadian Symbols, Canada's Economy, Canada's Regions
11. Seed ~150 questions across all topics sourced exclusively from the official guide, covering:
    - Multiple choice (4 options), True/False, and Fill-in-the-blank variants
    - Difficulty levels: EASY / MEDIUM / HARD
    - Each question includes `explanation` and `sourceRef` (chapter + guide page/section)
12. Seed 4 `Leader` records: Prime Minister, Governor General, Alberta Premier, Lt. Governor of Alberta
13. Seed 1 admin user from env vars

---

### Phase 4 — Authentication
*Depends on Phase 2 schema.*

14. Configure NextAuth.js v5 with Prisma adapter
15. Implement Credentials provider — username only (no password, no email); user picks or enters a username to start a session
16. Implement Guest mode — auto-generates an anonymous username (e.g. `guest_abc123`), prompts to choose a persistent username on first progress save
17. Protect routes via Next.js middleware (`matcher` for `/dashboard`, `/quiz`, `/admin`)
18. Role-based access: `ADMIN` role assigned via env var (`ADMIN_USERNAME`) at seed time — no password required, admin identified by username match

---

### Phase 5 — API Routes (Next.js App Router)
*Depends on Phases 2–4.*

20. `POST /api/auth/[...nextauth]` — handled by NextAuth (username-only Credentials provider)
21. `GET /api/topics` — list all topics with question counts
22. `POST /api/quiz/generate` — generate quiz by `{topicId?, difficulty?, count, mode}`, returns randomized question set with duplicate prevention per user session
23. `POST /api/quiz/[sessionId]/answer` — submit answer, return correctness + explanation
24. `POST /api/quiz/[sessionId]/complete` — finalize session, compute score, award achievements
25. `GET /api/progress` — user dashboard stats (accuracy, streaks, weak topics, history)
26. `GET/PUT /api/leaders` — fetch and update leader info (PUT: admin only)
27. `GET/POST/PUT/DELETE /api/admin/questions` — admin CRUD for questions
28. `GET /api/admin/users` — admin user list
29. `GET /api/admin/analytics` — aggregate stats
30. `GET /api/health` — Docker health check endpoint

All routes use:
- `zod` for input validation
- Centralized error handler
- Rate limiting via Redis-based middleware (falls back to in-memory without Redis)
- CSRF protection via NextAuth built-in tokens
- Parameterized Prisma queries (prevents SQL injection)

---

### Phase 6 — Frontend Pages & Components
*Depends on Phases 4–5. Steps within this phase can run in parallel.*

**Pages:**
- `/` — Landing page (Canadian-inspired hero, features, CTA)
- `/auth/login` — enter or create a username to start; no password required
- `/dashboard` — progress card, streak, weak topics, recent sessions
- `/study` — mode selector (Practice / Exam / Flashcard / Learn)
- `/study/practice` — topic-filtered practice with instant feedback
- `/study/exam` — exam simulator: 20q, 45-min countdown, pass/fail result
- `/study/flashcard` — flip card deck per topic
- `/study/learn` — guided reading mode with embedded questions
- `/leaders` — current leadership info panel
- `/admin` — admin dashboard (questions CRUD, leader updates, analytics, user management)

**Shared components:**
- `QuestionCard` (MCQ, T/F, Fill-blank variants)
- `ProgressBar`, `StreakBadge`, `ScoreCard`
- `Timer` (countdown for exam mode)
- `TopicPicker`, `DifficultyFilter`
- `DarkModeToggle`, `MobileNav`, `Breadcrumbs`
- `LeaderCard` (editable in admin)

**State (Zustand stores):**
- `useAuthStore` — user, session
- `useQuizStore` — active quiz session, answers, timer
- `useProgressStore` — cached dashboard stats

---

### Phase 7 — PWA + Accessibility
*Parallel with Phase 6.*

31. Configure `next-pwa` with `manifest.json` (Canadian red/white theme, app icons)
32. Add service worker for offline caching of study materials and flashcards
33. Implement dark/light mode via Tailwind `dark:` classes + `next-themes`
34. Ensure WCAG 2.1 AA: ARIA labels, focus rings, color contrast ≥ 4.5:1, keyboard nav for all interactive elements
35. Add `<meta name="viewport">`, responsive Tailwind breakpoints (mobile-first)

---

### Phase 8 — Security Hardening

36. Rate limiting on auth and quiz generation endpoints
37. Security headers via Next.js `next.config.js` `headers()` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
38. Input sanitization with `zod` at all API boundaries (username: alphanumeric + underscore, max 30 chars)
39. NextAuth JWT with short expiry + secure cookie settings (`httpOnly`, `sameSite: lax`)
40. Content Security Policy header

---

### Phase 9 — Testing
*Parallel with Phases 6–7, can begin once API is stable.*

42. Unit tests: Prisma query helpers, quiz generation algorithm, score calculation (`Jest`)
43. Component tests: `QuestionCard`, `Timer`, `ProgressBar` (`React Testing Library`)
44. API integration tests: quiz generation, auth flows (`Jest` + `supertest`)
45. E2E tests: registration → practice quiz → exam simulator → admin leader update (`Playwright`)
46. Docker health check test: verify `docker compose up` seeds DB and returns `200` on `/api/health`

---

### Phase 10 — Documentation & Delivery
*Depends on all phases.*

47. `README.md` — one-command setup, prerequisites, screenshots
48. `docs/LOCAL_SETUP.md` — step-by-step for beginners
49. `docs/API.md` — all endpoints with example request/response
50. `docs/DEPLOYMENT.md` — guide for AWS ECS / Azure AKS / Vercel + managed DB
51. `docs/ARCHITECTURE.md` — system diagram, DB ER diagram, auth flow, API flow
52. `docs/ROADMAP.md` — milestones, risk analysis, scalability, future enhancements (OpenAI integration, push notifications, bilingual EN/FR support)
53. `.vscode/extensions.json` + `.vscode/settings.json` for recommended dev tools

---

### Relevant Files to Create

| File | Purpose |
|---|---|
| `citi-study-app/docker-compose.yml` | All 5 service definitions |
| `citi-study-app/Dockerfile` | Multi-stage Next.js build |
| `citi-study-app/.env.example` | All env vars documented |
| `citi-study-app/prisma/schema.prisma` | Full DB schema |
| `citi-study-app/prisma/seed.ts` | 150+ questions + leaders + admin user |
| `citi-study-app/src/app/` | Next.js App Router pages |
| `citi-study-app/src/app/api/` | All API route handlers |
| `citi-study-app/src/components/` | Shared UI components |
| `citi-study-app/src/stores/` | Zustand stores |
| `citi-study-app/tests/` | Jest + Playwright tests |
| `citi-study-app/docs/` | All documentation |

---

### Verification Steps
1. Run `docker compose up --build` from `citi-study-app/` — should start all services with no manual steps
2. Navigate to `http://localhost:3000` — landing page renders correctly on mobile and desktop
3. Register a user → complete a 20-question exam → verify score saves to DB via Adminer at `http://localhost:8080`
4. Login as admin → update a leader → verify change reflected on `/leaders` page
5. Run `npm test` inside the app container — all unit/integration tests pass
6. Run `npx playwright test` — E2E suite passes
7. Lighthouse audit ≥ 90 on Performance, Accessibility, PWA
8. Verify service worker caches flashcards for offline use

---

### Decisions & Scope Boundaries

- **Unified Next.js container** for both frontend and API — avoids complexity of separate Express service while remaining production-splittable later
- **Questions seeded statically** from the official guide — no AI generation in v1; OpenAI integration reserved for v2
- **Redis is optional** via Docker Compose profile (`--profile cache`) — app works without it using in-memory rate limiting
- **No email or password** — username-only auth keeps setup to zero external dependencies and zero credential management
- **Alberta-specific leaders** included as requested; architecture supports any province
- **French/English bilingual** support is a v2 roadmap item — not in scope for v1

---

### Open Questions for Refinement

1. **Question authorship**: Should the ~150 seed questions be stored as a separate `questions.json` file (easy for non-devs to edit) or purely in the Prisma seed script?
2. **Guest mode persistence**: Should guest progress be saved to `localStorage` only, or persisted in the DB with an anonymous user record (allows converting to full account later)?
3. **Deployment target**: The docs will include a generic cloud deployment guide. Is there a preferred platform (AWS, Azure, Vercel + Supabase, DigitalOcean) to prioritize in the deployment docs?
4. **Admin username**: Should the admin username be fixed via `ADMIN_USERNAME` in `.env`, or should any user be promotable to admin from within the app?
5. **Question count**: Is 150 seed questions sufficient for v1, or should the seed script target a larger set (e.g. 300+) to better simulate randomized exams without repetition?
6. **Username uniqueness enforcement**: Should the login screen silently resume an existing session for a returning username, or always prompt confirmation before resuming?
