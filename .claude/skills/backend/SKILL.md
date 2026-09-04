---
name: backend
description: Standards and structure for Mourly's NestJS backend — SOLID modules, files under 100 lines, English naming, zero comments, no dead code, and full unit/integration/e2e coverage. Use when writing, refactoring, or reviewing anything under backend/.
---

# Backend standards — Mourly

Applies to everything under `backend/src`. `backend/src/generated/` is Prisma output: never edit it, never count it against these rules.

## Hard rules

These are not preferences. A change that breaks one of them is not done.

1. **No file over 100 lines.** Includes blank lines and imports. When a file grows past it, the file is doing more than one thing — split by responsibility, never by line count.
2. **Zero comments.** No `//`, no block comments, no JSDoc. If code needs explaining, the names are wrong or the function is too big. Extract a named function or a named constant instead of writing a sentence.
3. **English only** for every identifier, type, file name, and log message. User-facing strings stay in Spanish, hoisted into named constants at the top of the file.
4. **No dead code.** No unused exports, no scaffold left from a generator, no commented-out blocks, no "just in case" parameters. If nothing calls it, delete it.
5. **One responsibility per class.** If describing it needs the word "and", split it.
6. **Full coverage.** Every new unit of behavior ships with unit, integration, and e2e tests as applicable (see Testing).

## Layering

Request to Controller to Service to Prisma to Response.

| Layer | Does | Never does |
|---|---|---|
| Controller | Binds HTTP to a service call | Business logic, DB access, response shaping beyond the service's return |
| Service | All business logic | Touch Request/Response, format HTTP |
| DTO | Validates and types input via class-validator | Business logic |
| Guard | Authentication and authorization | Business logic |
| Mapper (`*.mapper.ts`) | Pure DB-row to response-shape functions | I/O of any kind |
| Pure module (no decorator) | Framework-free logic and calculations | Import Nest or Prisma |

Controllers stay thin enough to read in one screen. `auth.controller.ts` injects three services rather than hiding orchestration behind one fat service — explicit dependencies beat false simplicity.

## How to split a file that got too long

In order of preference:

1. **Extract pure functions** into a sibling module. Calendar math went to `availability-calendar.ts`, slot rules to `slot-validator.ts`, scheduling math to `match-scheduling.ts`. Pure modules are the cheapest to test and the easiest to reuse.
2. **Split reads from writes.** `AvailabilityViewService` serves the GET views; `AvailabilityService` owns the mutations.
3. **Extract a collaborator service.** `VerificationDeliveryService` owns "issue a code and email it, honoring the cooldown" so `AuthService` and `RegistrationService` both reuse it.
4. **Move queries behind a loader.** `MatchLoaderService` owns the shared `select` shape and exports `LoadedMatch` derived from its own return type, so the type can never drift from the query.
5. **Move literals out.** Long messages go to a `*.messages.ts`; static fixtures go to `.json` next to a typed loader.

## Dependency inversion

Swappable infrastructure hides behind an interface plus an injection token, and the module picks the implementation:

```ts
export const IMAGE_STORE = Symbol('IMAGE_STORE');

export interface ImageStore {
  save(key: string, file: Express.Multer.File): Promise<string>;
  remove(url: string): Promise<void>;
}
```

`StorageModule` binds `IMAGE_STORE` to `S3ImageStore` or `LocalImageStore` in a factory. `StorageService` never learns which one it got. Do the same for any adapter with a dev and a production form.

## Error handling

Services throw Nest HTTP exceptions (`BadRequestException`, `GoneException`) or return a **result union** when the caller must branch on the reason:

```ts
export type RotationResult =
  | { status: 'ok'; userId: string; token: string }
  | { status: 'invalid' }
  | { status: 'expired' }
  | { status: 'reuse_detected'; userId: string };
```

Use the union when more than one failure maps to a different HTTP code; a dedicated resolver (`AvailabilityLinkResolver`) turns it into the exception.

`AllExceptionsFilter` is global. It maps Prisma codes (P2002 to 409, P2025 to 404) and collapses anything unrecognized into a generic 500. Never leak an internal message.

Logging an error passes a stack string, never the `Error` object:

```ts
error instanceof Error ? error.stack : String(error)
```

## Security checklist for any new endpoint

Before an endpoint is done, confirm every line:

- Guarded with `JwtAuthGuard` (plus `AdminGuard` for `/admin`), or deliberately public with a documented reason.
- Input validated by a DTO. Arrays carry both `@ArrayMinSize` and `@ArrayMaxSize` — an unbounded array is a CPU denial-of-service through nested validation.
- Response selects only the fields the client needs. Never return a raw `user` row: it carries email and cellphone.
- Authenticated resources resolve ownership from the token or magic link, never from a client-supplied id.
- Mutating routes are covered by `CsrfOriginGuard` (global) and rate-limited: `@Throttle(AUTH_THROTTLE)` on credential routes, `PUBLIC_LINK_THROTTLE` on token routes.
- File uploads pass `imageUploadOptions`: size limit, MIME allowlist, and an extension derived from the allowlist rather than from `originalname`.
- Auth responses do not reveal whether an account exists. Registration, login, and resend all answer with the same neutral message.

## Testing

Three levels, all required to stay green:

**Unit** — pure modules and services with mocked collaborators, co-located as `*.spec.ts`. Prefer testing a pure module over a service wrapper: `match-scheduling.spec.ts` covers the scheduling rules without a database.

**Integration** — several real services wired against one in-memory store, proving they agree on the data. See `weekly-matching.integration.spec.ts`.

**E2E** — the booted Nest app over HTTP in `backend/test/`, covering guards, validation pipes, the exception filter, and cookies. These are the only tests that prove a route is actually protected.

Run `npm test` for unit and integration, `npm run test:e2e` for e2e. Coverage is expected at 100% for `backend/src` excluding `generated/` and `scripts/`; check with `npm run test:cov` before calling a change complete.

Write the failing test first when fixing a bug — a regression test that never failed proves nothing.

## Prisma

- The schema is split across `prisma/models/*.prisma`; edit the model file, not a generated artifact.
- After a schema change: `npx prisma migrate dev --name <change>` then `npx prisma generate`.
- Reuse a shared `select` constant rather than repeating shapes, and derive the TypeScript type from the query's return type.
- Multi-statement writes that must not half-apply go in `prisma.$transaction`.
- Never filter with a large `notIn` array built in application code. Push the condition into the query:

```ts
matchesAsUserA: { none: { status: { in: [...ACTIVE_MATCH_STATUSES] } } },
```

## Scheduled jobs

Cron services do nothing but find work and delegate. `MatchRecyclerService` loads overdue matches in one query and hands each to `MatchReschedulerService`; it holds no business logic of its own. Never load a list of ids and then re-query each one.

Crons run in every instance. Anything added here must be idempotent, because there is no distributed lock yet.
