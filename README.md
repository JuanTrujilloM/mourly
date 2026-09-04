# Mourly

Exclusive dating app for students at private universities in Colombia. Delivers one AI-curated match per week and drives it all the way to a confirmed in-person date.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v10+
- [PostgreSQL 16](https://www.postgresql.org/) via Homebrew

```bash
brew install postgresql@16
brew services start postgresql@16
```

---

## 1. Clone the repository

```bash
git clone https://github.com/JuanTrujilloM/theconnection.git
cd theconnection
```

---

## 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 3. Create the database

```bash
createdb mourly
```

---

## 4. Configure environment variables

### Backend — `backend/.env`

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://<your-mac-username>@localhost:5432/mourly"

# Optional for local dev (leave empty if not testing these features)
JWT_SECRET=any-random-string-for-local-dev
JWT_EXPIRES_IN=7d
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
OPENAI_API_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
AWS_SQS_QUEUE_URL=
```

> Replace `<your-mac-username>` with your system username (e.g. `juantrujillo`). No password required locally.

### Frontend — `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Run database migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

This generates the Prisma client and creates all tables in the local database.

---

## 6. Start the development servers

**Terminal 1 — Backend** (port 3001):

```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend** (port 3000):

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API surface

Everything except `/health`, `/catalog` and the tokenized flow requires a
session cookie. Everything under `/admin` additionally requires the caller's
email to be in `ADMIN_EMAILS`.

| Area | Endpoints |
|---|---|
| Public | `GET /health`, `GET /catalog` |
| Auth | `POST /auth/register`, `/login`, `/verify`, `/resend`, `/refresh`, `/logout`, `GET /auth/me` |
| Onboarding | `GET` and `POST /profile`, `PATCH /profile/availability`, `GET` and `POST /preferences` |
| Weekly match | `GET /matches/current`, `POST /matches/current/reject`, `POST /matches/:id/report` |
| Tokenized flow | `GET` and `POST /availability/:token`, `GET` and `POST /availability/:token/venues` |
| Post-date | `POST /dates/:id/feedback` |
| Admin | `/admin/users`, `/admin/matches`, `/admin/feedback`, `/admin/reports`, `/admin/stats`, `POST /admin/matching/run` |
| Admin catalogs | `/admin/venues`, `/admin/universities`, `/admin/hobbies` |

---

## Useful commands

```bash
# Add a migration after changing the schema
cd backend && npx prisma migrate dev --name <name>

# Regenerate the Prisma client
cd backend && npx prisma generate

# Visual database explorer
cd backend && npx prisma studio

# Lint
cd backend && npm run lint
cd frontend && npm run lint

# Tests
cd backend && npm test          # unit + integration
cd backend && npm run test:e2e  # HTTP end to end
cd frontend && npm test
```

---

## Project structure

```
theconnection/            # repository name; the product is Mourly
├── frontend/
│   └── src/
│       ├── app/                 # Pages (Next.js App Router)
│       ├── components/shared/   # Reusable components
│       ├── hooks/               # State management with React Query
│       └── lib/api/             # Backend API calls
└── backend/
    ├── prisma/
    │   ├── models/              # One .prisma file per model
    │   └── migrations/          # SQL migration history
    ├── test/                    # End-to-end specs
    └── src/
        ├── common/              # Guards, filters, decorators, shared utils
        ├── config/              # PrismaService, env validation
        └── modules/             # One module per domain
```

---

## Known limitations and pending work

Recorded so nobody rediscovers them the hard way. Ordered by how much
damage they can do.

### Blocks a multi-instance deploy

**The cron jobs have no distributed lock.** Weekly matching, match
recycling, response timeouts and the feedback window all run on `@Cron`
inside the API process. With two instances behind a load balancer every
job fires twice: duplicate matches for every eligible student and
duplicate notifications. `Match` has no unique constraint on the pair
either, so nothing stops it at the database level. Needs a lock (the
stack already runs Redis) or moving the jobs to a single scheduled worker
before scaling past one instance.

**Rate limiting counts in memory.** `ThrottlerModule` uses its default
in-process store, so the effective limit is the configured value times
the number of instances.

**The chatbot conversation cache is a `Map`.** Lost on restart and not
shared between instances; a user mid-conversation starts over.

### Incomplete features

**WhatsApp is not wired end to end.** `WhatsappSenderService.send` logs
instead of calling the Cloud API, and there is no inbound webhook, so
`ChatbotService.handleIncomingMessage` is unreachable. The AI agent, its
tools and its moderation all exist and are tested; only the transport is
missing.

**Reporting a match does not end it.** `POST /matches/:id/report` records
the report for moderation but leaves the pair matched. Chaining it with
`POST /matches/current/reject` is a product decision, not a technical
one.

### Test coverage

**Backend is thorough, frontend is not.** The backend runs 536 unit and
integration specs plus 94 end-to-end. The frontend has 67 specs covering
the logic that can break silently — the axios refresh interceptor, the
zod schemas, the navigation gates, the calendar drag maths — which is
about 10% of statements. Pages and presentational components are
untested.

### Documentation drift

**`CLAUDE.MD` still describes infrastructure that does not exist**: AWS
Lambda and EventBridge for weekly matching, SQS, and pgvector embeddings.
The real implementation is an in-process cron and a deterministic
weighted scorer feeding Gale-Shapley, which is a better fit at this size
— but the document claims otherwise.

**`CLAUDE.MD` and `.claude/skills/backend` disagree about comments.** The
document says to comment the *why*; the skill says zero comments, which
is what the codebase now follows. A future contributor gets contradictory
instructions until one of them is corrected.

### Operational

**No CI.** Nothing runs lint, typecheck or the suites on a push, so the
standards above depend on whoever is looking.

**No root `package.json`.** The `npm run dev` shortcut referenced in some
notes does not exist; start each side in its own terminal as described
above.

**Renaming to Mourly did not rename the repository.** The remote is still
`theconnection`, and the local database credentials in
`db/docker-compose.yml` are now `mourly` — an existing volume keeps the
old names until recreated with `docker compose down -v` (which deletes
local data).

See [CLAUDE.md](CLAUDE.md) for full architecture, data model, and code conventions.
