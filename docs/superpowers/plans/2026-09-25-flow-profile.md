# Perfil antes del plan — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el link del SMS del match abra primero el perfil de la otra persona (fotos en carrusel con flechas, lo que tienen en común, bio) y desde ahí se pase a lugares y horarios, con lenguaje de "plan" en vez de "cita".

**Architecture:** Backend: un endpoint público nuevo `GET /availability/:token/profile` (mismo token del flujo, mismo resolver) que devuelve el perfil con solo el primer nombre, los hobbies compartidos y cuándo se cierra el match. El SMS del match cambia de texto y su link apunta a `/flow/:token`. Frontend: página nueva `app/flow/[token]/page.tsx` con tres componentes (`PhotoCarousel`, `CommonGroundSign`, `FlowProfile`) y la paleta "feria" (amarillo, crema, Bungee) limitada a esa pantalla; ajustes de copy "plan" en el resto del flujo del link.

**Tech Stack:** NestJS 11 + Prisma 7 (Jest), Next.js 16 + React 19 + Tailwind v4 + React Query (Vitest + Testing Library, jsdom).

**Spec:** Propuesta aprobada "Perfil antes del plan", opción 1 "Toque de feria": https://claude.ai/artifact/WMuuArpBQcDV2nnid9LKKo (v4). Decisiones de la conversación del 2026-09-25: arriba el bloque A (logo original, "Esta semana", "Alguien de {U}", "Conocé a {nombre}", carrusel recto con flechas), abajo el bloque B (etiqueta magenta con nombre y edad, carrera/U/semestre sobre la foto, flecha amarilla con lo que tienen en común, bio); franja amarillo/magenta/azul bajo el logo, marco crema con sombra magenta dura, barras del carrusel en los tres colores; sin botón "Esta semana no".

## Global Constraints

- Voseo en todo el copy ("Conocé", "marcás", "elegís").
- Antes de confirmar el plan, la otra persona se nombra solo por el primer nombre.
- En las pantallas del link se dice "plan", nunca "cita". La frase de marca "Una cita real por semana" (footer, sello, metadatos) no se toca en este plan.
- Solo se muestran los hobbies compartidos (`backend/src/modules/matches/shared-hobbies.ts`: "a hobby the viewer does not have stays private"). La línea "También: …" de la maqueta NO se implementa.
- Copy aprobado: botón "Cuadrar el plan"; SMS `Mourly: esta semana hay alguien para vos. Conocé a {primer nombre}, de {U}: {url}`.
- El SMS del match cabe en un segmento GSM-7 (≤ 160) con el origen de producción `https://www.mourly.com` (test existente en `sms-messages.spec.ts`).
- La paleta feria (`#FFC531` amarillo, `#FFF1D6` crema, `#1B1420` tinta, Bungee) solo se usa en la pantalla del perfil del link.
- Las fotos cambian solo cuando la persona lo pide (flecha, deslizar, teclado). Nunca con temporizador.
- Comentarios en inglés, de una línea `//`, que expliquen el porqué (CLAUDE.md del repo). Sin `any`.

## Review Focus

- Perfil sin fotos: el carrusel muestra el retrato de relleno desenfocado, sin flechas ni barras (test en Task 4).
- Perfil con una sola foto: sin flechas ni barras (test en Task 4).
- Sin hobbies en común: la flecha amarilla no aparece (test en Task 4).
- Bio vacía: no se pinta el bloque de la bio ni las comillas (test en Task 5).
- Link que ya está en `AVAILABILITY` (ya eligió lugares): el botón lleva a `/availability/:token` y el texto dice "Después marcás la hora." (test en Task 5); link consumido o `DATE` → `COMPLETED` (test en Task 2).

Conocido y fuera de alcance: un match rechazado cuyo link todavía no venció sigue mostrando el perfil, igual que hoy lo hacen lugares y horarios.

---

### Task 1: `firstName` en backend y endpoint del perfil por token

**Files:**
- Create: `backend/src/common/utils/first-name.ts`
- Create: `backend/src/common/utils/first-name.spec.ts`
- Create: `backend/src/modules/availability/flow-profile.service.ts`
- Create: `backend/src/modules/availability/flow-profile.service.spec.ts`
- Modify: `backend/src/modules/availability/availability.controller.ts`
- Modify: `backend/src/modules/availability/availability.module.ts`

**Interfaces:**
- Produces: `firstName(fullName: string): string`; `FlowProfileService.getProfileView(token: string): Promise<FlowProfileView>`; ruta `GET /availability/:token/profile` que responde
  `{ step: 'COMPLETED' }` o `{ step: 'VENUE' | 'AVAILABILITY', partner: { firstName: string, age: number, university: string, major: string, semester: string, biography: string, photos: string[] }, sharedHobbies: string[], closesAt: string /* ISO */ }`.

- [ ] **Step 1: Write the failing tests**

`backend/src/common/utils/first-name.spec.ts`:

```ts
import { firstName } from './first-name';

describe('firstName', () => {
  it('keeps only the first word of a full name', () => {
    expect(firstName('Miguel Ángel Torres')).toBe('Miguel');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(firstName('  Sara   Betancur ')).toBe('Sara');
  });

  it('returns a single name as is', () => {
    expect(firstName('Jeronimo')).toBe('Jeronimo');
  });
});
```

`backend/src/modules/availability/flow-profile.service.spec.ts`:

```ts
import { GoneException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import {
  AvailabilityLinkService,
  LinkValidation,
} from '../availability-link/availability-link.service';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';
import { FlowProfileService } from './flow-profile.service';

const CREATED_AT = new Date('2026-09-24T00:00:00.000Z');

const okLink = (
  step: 'VENUE' | 'AVAILABILITY' | 'DATE',
  userId = 'u1',
): LinkValidation => ({
  status: 'ok',
  link: { id: 'link-1', matchId: 'm1', userId, step },
});

function userWith(
  name: string,
  hobbies: string[],
  photos: { url: string; isPrimary: boolean }[] = [],
) {
  return {
    profile: {
      name,
      dateOfBirth: new Date('2002-01-15'),
      university: name.startsWith('Miguel') ? 'CES' : 'EAFIT',
      major: name.startsWith('Miguel') ? 'Psicología' : 'Música',
      semester: '7',
      biography: 'Teatro, cine club y caminatas.',
      photos,
      hobbies: hobbies.map((hobby) => ({ hobby: { name: hobby } })),
    },
  };
}

const MATCH = {
  userAId: 'u1',
  createdAt: CREATED_AT,
  userA: userWith('Felipe Cardona', ['Teatro', 'Música en vivo']),
  userB: userWith(
    'Miguel Ángel Torres',
    ['Senderismo', 'Teatro', 'Cine'],
    [
      { url: 'https://cdn/second.jpg', isPrimary: false },
      { url: 'https://cdn/primary.jpg', isPrimary: true },
    ],
  ),
};

function build(validation: LinkValidation, match: unknown = MATCH) {
  const links = { validate: jest.fn().mockResolvedValue(validation) };
  const findUnique = jest.fn().mockResolvedValue(match);
  const prisma = { match: { findUnique } } as unknown as PrismaService;
  const service = new FlowProfileService(
    prisma,
    new AvailabilityLinkResolver(links as unknown as AvailabilityLinkService),
  );
  return { service, findUnique };
}

describe('FlowProfileService', () => {
  it('names the partner by first name and puts the primary photo first', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.step).toBe('VENUE');
    expect(view.partner).toEqual({
      firstName: 'Miguel',
      age: expect.any(Number),
      university: 'CES',
      major: 'Psicología',
      semester: '7',
      biography: 'Teatro, cine club y caminatas.',
      photos: ['https://cdn/primary.jpg', 'https://cdn/second.jpg'],
    });
  });

  it('shows only the hobbies both people share', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.sharedHobbies).toEqual(['Teatro']);
  });

  it('shows user A to user B', async () => {
    const { service } = build(okLink('VENUE', 'u2'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.partner.firstName).toBe('Felipe');
    expect(view.partner.photos).toEqual([]);
  });

  it('closes 48 hours after the match was created', async () => {
    const { service } = build(okLink('VENUE'));

    const view = await service.getProfileView('t');

    if (view.step === 'COMPLETED') throw new Error('expected a profile');
    expect(view.closesAt).toBe('2026-09-26T00:00:00.000Z');
  });

  it('keeps the AVAILABILITY step so the page skips places', async () => {
    const { service } = build(okLink('AVAILABILITY'));

    const view = await service.getProfileView('t');

    expect(view.step).toBe('AVAILABILITY');
  });

  it('reports a date link as COMPLETED', async () => {
    const { service, findUnique } = build(okLink('DATE'));

    expect(await service.getProfileView('t')).toEqual({ step: 'COMPLETED' });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('reports a consumed link as COMPLETED', async () => {
    const { service } = build({ status: 'consumed' });

    expect(await service.getProfileView('t')).toEqual({ step: 'COMPLETED' });
  });

  it('maps an expired link to 410 Gone', async () => {
    const { service } = build({ status: 'expired' });

    await expect(service.getProfileView('t')).rejects.toThrow(GoneException);
  });

  it('maps an unknown link to 404', async () => {
    const { service } = build({ status: 'invalid' });

    await expect(service.getProfileView('t')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('maps a partner without profile to 404', async () => {
    const { service } = build(okLink('VENUE'), {
      ...MATCH,
      userB: { profile: null },
    });

    await expect(service.getProfileView('t')).rejects.toThrow(
      NotFoundException,
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx jest src/common/utils/first-name.spec.ts src/modules/availability/flow-profile.service.spec.ts`
Expected: FAIL with "Cannot find module './first-name'" and "Cannot find module './flow-profile.service'".

- [ ] **Step 3: Write minimal implementation**

`backend/src/common/utils/first-name.ts`:

```ts
// Before a plan is confirmed the other person is only ever named this way.
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
```

`backend/src/modules/availability/flow-profile.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ageFrom } from '../../common/utils/age';
import { firstName } from '../../common/utils/first-name';
import { RESPONSE_TIMEOUT_HOURS } from '../matches/match-response.constants';
import { sharedHobbyNames } from '../matches/shared-hobbies';
import { AvailabilityLinkResolver } from './availability-link-resolver.service';

const INVALID_MESSAGE = 'Este enlace no es válido.';
const HOUR_IN_MS = 3_600_000;

const PROFILE_SELECTION = {
  select: {
    profile: {
      select: {
        name: true,
        dateOfBirth: true,
        university: true,
        major: true,
        semester: true,
        biography: true,
        photos: {
          select: { url: true, isPrimary: true },
          orderBy: { createdAt: 'asc' as const },
        },
        hobbies: { select: { hobby: { select: { name: true } } } },
      },
    },
  },
};

export interface FlowPartner {
  firstName: string;
  age: number;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: string[];
}

export type FlowProfileView =
  | { step: 'COMPLETED' }
  | {
      step: 'VENUE' | 'AVAILABILITY';
      partner: FlowPartner;
      sharedHobbies: string[];
      closesAt: string;
    };

// The screen behind the match SMS, before places and hours. Same fields the
// app shows a matched user, but only the first name: the surname waits for a
// confirmed plan. Read-only: nothing here moves the link or the match.
@Injectable()
export class FlowProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: AvailabilityLinkResolver,
  ) {}

  async getProfileView(token: string): Promise<FlowProfileView> {
    const link = await this.resolver.resolveForView(token);
    if (!link || link.step === 'DATE') {
      return { step: 'COMPLETED' };
    }

    const match = await this.prisma.match.findUnique({
      where: { id: link.matchId },
      select: {
        userAId: true,
        createdAt: true,
        userA: PROFILE_SELECTION,
        userB: PROFILE_SELECTION,
      },
    });
    const [viewer, other] =
      match?.userAId === link.userId
        ? [match.userA, match.userB]
        : [match?.userB, match?.userA];
    const profile = other?.profile;
    if (!match || !profile) {
      throw new NotFoundException(INVALID_MESSAGE);
    }

    return {
      step: link.step,
      partner: {
        firstName: firstName(profile.name),
        age: ageFrom(profile.dateOfBirth),
        university: profile.university,
        major: profile.major,
        semester: profile.semester,
        biography: profile.biography,
        photos: primaryFirst(profile.photos),
      },
      sharedHobbies: sharedHobbyNames(viewer ?? null, other ?? null),
      // Mirror of MatchTimeoutService: a match with no date closes itself then.
      closesAt: new Date(
        match.createdAt.getTime() + RESPONSE_TIMEOUT_HOURS * HOUR_IN_MS,
      ).toISOString(),
    };
  }
}

function primaryFirst(photos: { url: string; isPrimary: boolean }[]): string[] {
  return [
    ...photos.filter((photo) => photo.isPrimary),
    ...photos.filter((photo) => !photo.isPrimary),
  ].map((photo) => photo.url);
}
```

`backend/src/modules/availability/availability.controller.ts` — importar el servicio, inyectarlo y agregar la ruta después de `getAvailability`:

```ts
import { FlowProfileService } from './flow-profile.service';
```

```ts
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly viewService: AvailabilityViewService,
    private readonly profileService: FlowProfileService,
  ) {}
```

```ts
  @Get(':token/profile')
  getProfile(@Param('token') token: string) {
    return this.profileService.getProfileView(token);
  }
```

`backend/src/modules/availability/availability.module.ts` — agregar `FlowProfileService` al import y a `providers`:

```ts
import { FlowProfileService } from './flow-profile.service';
```

```ts
  providers: [
    AvailabilityService,
    AvailabilityViewService,
    AvailabilityLinkResolver,
    MatchContextService,
    FlowProfileService,
  ],
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx jest src/common/utils/first-name.spec.ts src/modules/availability && npx tsc --noEmit -p tsconfig.json`
Expected: PASS, sin errores de tipos.

- [ ] **Step 5: Commit**

```bash
git add backend/src/common/utils/first-name.ts backend/src/common/utils/first-name.spec.ts backend/src/modules/availability
git commit -m "feat(flow): partner profile behind the match link"
```

---

### Task 2: SMS del match y link al perfil

**Files:**
- Modify: `backend/src/modules/notifications/partner-summary.ts` (exportar el nombre del compañero desconocido)
- Modify: `backend/src/modules/notifications/sms-messages.ts`
- Modify: `backend/src/modules/notifications/sms-messages.spec.ts`
- Modify: `backend/src/modules/notifications/test-helpers.ts:27`
- Modify: `backend/src/modules/matches/match-invite.service.ts:72`
- Modify: `backend/src/modules/matches/match-invite.service.spec.ts:93`
- Modify: `backend/src/scripts/preview-emails.ts:18`

**Interfaces:**
- Consumes: `firstName(fullName: string): string` (Task 1).
- Produces: link del SMS `${FRONTEND_URL}/flow/${token}`; `UNKNOWN_PARTNER_NAME = 'tu match'`.

- [ ] **Step 1: Write the failing tests**

En `test-helpers.ts`, el link del match deja de ir a lugares:

```ts
export const INVITE_URL = `${APP_ORIGIN}/flow/${TOKEN}`;
```

En `sms-messages.spec.ts`, importar el nombre desconocido y reemplazar el test `'still fits the invite with a long name'` por estos:

```ts
import { UNKNOWN_PARTNER_NAME } from './partner-summary';
```

```ts
  it('invites to meet the partner by first name and university', () => {
    const message = smsMessageFor(notificationOf('match_invite'));

    expect(message).toBe(
      `Mourly: esta semana hay alguien para vos. Conocé a Sofia, de CES: ${INVITE_URL}`,
    );
  });

  it('leaves the university out when it is unknown', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: { ...PARTNER, university: null },
    });

    expect(message).toContain(`Conocé a Sofia: ${INVITE_URL}`);
  });

  it('keeps "tu match" whole when the partner has no profile', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: { ...PARTNER, name: UNKNOWN_PARTNER_NAME, university: null },
    });

    expect(message).toContain(`Conocé a tu match: ${INVITE_URL}`);
  });

  it('still fits the invite with a long first name and university', () => {
    const message = smsMessageFor({
      ...notificationOf('match_invite'),
      partner: {
        ...PARTNER,
        name: 'Maximiliano Andrés Restrepo',
        university: 'Javeriana de Cali',
      },
    });

    expect(message.length).toBeLessThanOrEqual(SINGLE_SEGMENT);
    expect(message).toMatch(GSM7_ALPHABET);
    expect(message).not.toContain('Restrepo');
  });
```

En `match-invite.service.spec.ts:93`:

```ts
    expect(results[0].url).toBe('https://app.test/flow/token-1');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npx jest src/modules/notifications src/modules/matches/match-invite.service.spec.ts`
Expected: FAIL — el texto sigue siendo "tenés match…", la URL sigue terminando en `/places` y `UNKNOWN_PARTNER_NAME` no existe.

- [ ] **Step 3: Write minimal implementation**

`partner-summary.ts` — exportar la constante y usarla:

```ts
export const UNKNOWN_PARTNER_NAME = 'tu match';

const UNKNOWN_PARTNER: PartnerSummary = {
  name: UNKNOWN_PARTNER_NAME,
  age: null,
  university: null,
  major: null,
  photoUrl: null,
};
```

`sms-messages.ts` — imports y función nueva, y el `case 'match_invite'` la llama:

```ts
import { firstName } from '../../common/utils/first-name';
import { UNKNOWN_PARTNER_NAME } from './partner-summary';
```

```ts
// The link opens the partner's profile, so the SMS only has to make them
// someone: first name and university, never the surname. "Conocé" keeps its
// accent: é is inside GSM-7.
function matchInviteMessage(
  notification: Extract<Notification, { kind: 'match_invite' }>,
): string {
  const { partner } = notification;
  const name =
    partner.name === UNKNOWN_PARTNER_NAME
      ? partner.name
      : toGsmText(firstName(partner.name));
  const from = partner.university ? `, de ${toGsmText(partner.university)}` : '';
  return (
    `${BRAND_PREFIX} esta semana hay alguien para vos. ` +
    `Conocé a ${name}${from}: ${notification.availabilityUrl}`
  );
}
```

```ts
    case 'match_invite':
      return matchInviteMessage(notification);
```

`match-invite.service.ts:72`:

```ts
    const url = `${this.frontendUrl()}/flow/${token}`;
```

`preview-emails.ts:18`:

```ts
const availabilityUrl = 'http://localhost:3000/flow/sample-token';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npx jest src/modules/notifications src/modules/matches && npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/notifications backend/src/modules/matches/match-invite.service.ts backend/src/modules/matches/match-invite.service.spec.ts backend/src/scripts/preview-emails.ts
git commit -m "feat(sms): match invite opens the partner's profile"
```

---

### Task 3: Capa de datos del frontend y utilidades

**Files:**
- Create: `frontend/src/types/flow-profile.ts`
- Create: `frontend/src/lib/utils/first-name.ts`
- Create: `frontend/src/lib/utils/first-name.test.ts`
- Modify: `frontend/src/lib/utils/format.ts` (agregar `formatSemester`)
- Modify: `frontend/src/lib/utils/format.test.ts`
- Modify: `frontend/src/lib/api/availability.ts` (agregar `fetchFlowProfile`)
- Modify: `frontend/src/hooks/useAvailabilityFlow.ts` (agregar `useFlowProfile`)

**Interfaces:**
- Consumes: `GET /availability/:token/profile` (Task 1).
- Produces: tipos `FlowPartner`, `OpenFlowProfile`, `FlowProfileView`; `firstName(fullName: string): string`; `formatSemester(semester: string): string`; `fetchFlowProfile(token: string): Promise<FlowProfileView>`; `useFlowProfile(token: string)` (React Query, key `['flowProfile', token]`).

- [ ] **Step 1: Write the failing tests**

`frontend/src/lib/utils/first-name.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { firstName } from './first-name';

describe('firstName', () => {
  it('keeps only the first word of a full name', () => {
    expect(firstName('Miguel Ángel Torres')).toBe('Miguel');
  });

  it('ignores surrounding and repeated spaces', () => {
    expect(firstName('  Sara   Betancur ')).toBe('Sara');
  });
});
```

En `format.test.ts`, agregar `formatSemester` al import y este bloque al final:

```ts
describe('formatSemester', () => {
  it('turns a semester number into an ordinal', () => {
    expect(formatSemester('7')).toBe('7.º sem.');
  });

  it('shows anything that is not a plain number as stored', () => {
    expect(formatSemester('Egresado')).toBe('Egresado');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npx vitest run src/lib/utils/first-name.test.ts src/lib/utils/format.test.ts`
Expected: FAIL — `./first-name` no existe y `formatSemester` no se exporta.

- [ ] **Step 3: Write minimal implementation**

`frontend/src/lib/utils/first-name.ts`:

```ts
// Before a plan is confirmed the other person is only ever named this way.
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
```

Al final de `frontend/src/lib/utils/format.ts`:

```ts
// "7" -> "7.º sem."; a value that is not a plain number is shown as stored.
export function formatSemester(semester: string): string {
  const value = semester.trim();
  return /^\d+$/.test(value) ? `${value}.º sem.` : semester;
}
```

`frontend/src/types/flow-profile.ts`:

```ts
// Mirror of the backend's FlowProfileView (availability/flow-profile.service.ts).
export interface FlowPartner {
  firstName: string;
  age: number;
  university: string;
  major: string;
  semester: string;
  biography: string;
  photos: string[];
}

export interface OpenFlowProfile {
  step: 'VENUE' | 'AVAILABILITY';
  partner: FlowPartner;
  sharedHobbies: string[];
  closesAt: string;
}

export type FlowProfileView = OpenFlowProfile | { step: 'COMPLETED' };
```

En `frontend/src/lib/api/availability.ts` (import del tipo arriba, función al final):

```ts
import type { FlowProfileView } from '@/types/flow-profile';
```

```ts
export async function fetchFlowProfile(
  token: string,
): Promise<FlowProfileView> {
  const { data } = await apiClient.get<FlowProfileView>(
    `/availability/${token}/profile`,
  );
  return data;
}
```

En `frontend/src/hooks/useAvailabilityFlow.ts` (agregar `fetchFlowProfile` al import existente y el hook al final):

```ts
export function useFlowProfile(token: string) {
  return useQuery({
    queryKey: ['flowProfile', token],
    queryFn: () => fetchFlowProfile(token),
    retry: false,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && npx vitest run src/lib/utils && npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/types/flow-profile.ts frontend/src/lib/utils frontend/src/lib/api/availability.ts frontend/src/hooks/useAvailabilityFlow.ts
git commit -m "feat(flow): profile view client, first name and semester helpers"
```

---

### Task 4: Paleta feria, carrusel de fotos y flecha de lo común

**Files:**
- Modify: `frontend/src/app/globals.css` (tokens feria y utilidades `feria-stripe`, `rotulo`)
- Modify: `frontend/src/app/layout.tsx` (fuente Bungee)
- Create: `frontend/src/components/flow-profile/PhotoCarousel.tsx`
- Create: `frontend/src/components/flow-profile/PhotoCarousel.test.tsx`
- Create: `frontend/src/components/flow-profile/CommonGroundSign.tsx`
- Create: `frontend/src/components/flow-profile/CommonGroundSign.test.tsx`

**Interfaces:**
- Produces: `<PhotoCarousel photos={string[]} name={string} />`; `<CommonGroundSign hobbies={string[]} />` (devuelve `null` sin hobbies); clases `bg-rotulo-amarillo`, `text-rotulo-tinta`, `text-rotulo-crema`, `border-rotulo-crema`, `feria-stripe`, `rotulo`.

- [ ] **Step 1: Write the failing tests**

`frontend/src/components/flow-profile/PhotoCarousel.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PhotoCarousel } from './PhotoCarousel';

const PHOTOS = ['https://cdn/a.jpg', 'https://cdn/b.jpg', 'https://cdn/c.jpg'];

const trackOf = (container: HTMLElement) =>
  container.querySelector('[data-track]') as HTMLElement;

describe('PhotoCarousel', () => {
  it('starts on the first photo with only the next arrow enabled', () => {
    render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    expect(screen.getByRole('button', { name: 'Foto anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Foto siguiente' })).toBeEnabled();
  });

  it('moves forward and back with the arrows', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    fireEvent.click(screen.getByRole('button', { name: 'Foto siguiente' }));
    expect(trackOf(container).style.transform).toBe('translateX(-100%)');

    fireEvent.click(screen.getByRole('button', { name: 'Foto anterior' }));
    expect(trackOf(container).style.transform).toBe('translateX(0%)');
  });

  it('stops at the last photo', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const next = screen.getByRole('button', { name: 'Foto siguiente' });

    fireEvent.click(next);
    fireEvent.click(next);

    expect(next).toBeDisabled();
    expect(trackOf(container).style.transform).toBe('translateX(-200%)');
  });

  it('moves with the arrow keys', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);

    fireEvent.keyDown(screen.getByRole('group'), { key: 'ArrowRight' });

    expect(trackOf(container).style.transform).toBe('translateX(-100%)');
  });

  it('changes photo on a horizontal swipe', () => {
    const { container } = render(<PhotoCarousel photos={PHOTOS} name="Miguel" />);
    const group = screen.getByRole('group');

    fireEvent.pointerDown(group, { clientX: 220 });
    fireEvent.pointerUp(group, { clientX: 120 });

    expect(trackOf(container).style.transform).toBe('translateX(-100%)');
  });

  it('shows no arrows or bars with a single photo', () => {
    const { container } = render(
      <PhotoCarousel photos={['https://cdn/a.jpg']} name="Miguel" />,
    );

    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelector('[data-segment]')).toBeNull();
  });

  it('shows the blurred stand-in when there are no photos', () => {
    const { container } = render(<PhotoCarousel photos={[]} name="Miguel" />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
```

`frontend/src/components/flow-profile/CommonGroundSign.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommonGroundSign } from './CommonGroundSign';

describe('CommonGroundSign', () => {
  it('points at what both people like', () => {
    render(<CommonGroundSign hobbies={['Teatro', 'Cine']} />);

    expect(
      screen.getByText('A los dos les gusta: Teatro · Cine'),
    ).toBeInTheDocument();
  });

  it('renders nothing when they share no hobby', () => {
    const { container } = render(<CommonGroundSign hobbies={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd frontend && npx vitest run src/components/flow-profile`
Expected: FAIL — los módulos `./PhotoCarousel` y `./CommonGroundSign` no existen.

- [ ] **Step 3: Write minimal implementation**

`frontend/src/app/globals.css` — dentro del primer `@theme`, después de `--color-papel`:

```css
  /* Feria: the fairground colors of the Rótulo board. They live on the match
     profile screen only, the way the hologram lives on the carné. */
  --color-rotulo-amarillo: #FFC531;
  --color-rotulo-crema: #FFF1D6;
  --color-rotulo-tinta: #1B1420;
```

y después de `--font-mono: var(--font-dm-mono);`:

```css
  --font-rotulo: var(--font-bungee);
```

Y junto a las otras `@utility` (antes de `/* The carné's laminate … */`):

```css
/* The profile screen's fairground stripe: amarillo, magenta, azul. */
@utility feria-stripe {
  height: 7px;
  border-radius: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--color-rotulo-amarillo) 0 16px,
    var(--color-magenta-500) 16px 32px,
    var(--color-azul-500) 32px 48px
  );
}

/* Painted-sign lettering: the name tag and the common-ground sign only. */
@utility rotulo {
  font-family: var(--font-rotulo), "Arial Black", sans-serif;
  text-transform: uppercase;
  line-height: 1.15;
}
```

`frontend/src/app/layout.tsx` — importar `Bungee` junto a las otras fuentes, declararla después de `dmMono` y sumarla al `className` del `<html>`:

```ts
import { Bricolage_Grotesque, Bungee, DM_Mono, Newsreader } from "next/font/google";
```

```ts
// Painted-sign lettering, only on the match profile's name tag and sign.
const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});
```

```tsx
      className={`${bricolage.variable} ${newsreader.variable} ${dmMono.variable} ${bungee.variable} h-full antialiased`}
```

`frontend/src/components/flow-profile/PhotoCarousel.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';
import { BlurredFigures } from '@/components/shared/BlurredFigures';

// One color per photo, cycling through the feria stripe.
const SEGMENT_COLORS = ['bg-rotulo-amarillo', 'bg-magenta-500', 'bg-azul-400'];
const SWIPE_THRESHOLD_PX = 40;
const ARROW_PATHS = { prev: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7' } as const;

// Photos change only when the person asks: an arrow, a swipe or an arrow key,
// never a timer. The arrows blur what slides underneath them (brand rule).
export function PhotoCarousel({ photos, name }: { photos: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const swipeStart = useRef<number | null>(null);
  const count = photos.length;
  const show = (to: number) => setIndex(Math.max(0, Math.min(count - 1, to)));

  if (count === 0) {
    return (
      <div className="bg-grafito clip-rounded relative aspect-[4/5] rounded-[17px]">
        <BlurredFigures className="h-full w-full" />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${name}`}
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') show(index + 1);
        if (event.key === 'ArrowLeft') show(index - 1);
      }}
      onPointerDown={(event) => {
        if (!(event.target as HTMLElement).closest('button')) {
          swipeStart.current = event.clientX;
        }
      }}
      onPointerUp={(event) => {
        if (swipeStart.current === null) return;
        const distance = event.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(distance) > SWIPE_THRESHOLD_PX) {
          show(index + (distance < 0 ? 1 : -1));
        }
      }}
      className="bg-grafito clip-rounded relative aspect-[4/5] touch-pan-y rounded-[17px] select-none"
    >
      <div
        data-track
        className="ease-brand flex h-full transition-transform duration-(--dur-slow) motion-reduce:transition-none"
        style={{ transform: `translateX(${-index * 100}%)` }}
      >
        {photos.map((url, photoIndex) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${photoIndex}-${url}`}
            src={url}
            alt={`Foto ${photoIndex + 1} de ${count} de ${name}`}
            aria-hidden={photoIndex !== index}
            draggable={false}
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <div aria-hidden className="absolute inset-x-3 top-3 flex gap-1.5">
            {photos.map((url, photoIndex) => (
              <span
                key={`${photoIndex}-${url}`}
                data-segment
                className={`h-[3px] flex-1 rounded-full ${
                  photoIndex === index
                    ? SEGMENT_COLORS[photoIndex % SEGMENT_COLORS.length]
                    : 'bg-blanco/35'
                }`}
              />
            ))}
          </div>
          <ArrowButton
            direction="prev"
            disabled={index === 0}
            onClick={() => show(index - 1)}
          />
          <ArrowButton
            direction="next"
            disabled={index === count - 1}
            onClick={() => show(index + 1)}
          />
        </>
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Foto anterior' : 'Foto siguiente'}
      className={`bg-medianoche/45 border-blanco/20 text-blanco absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition disabled:opacity-30 ${
        direction === 'prev' ? 'left-2.5' : 'right-2.5'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={ARROW_PATHS[direction]} />
      </svg>
    </button>
  );
}
```

`frontend/src/components/flow-profile/CommonGroundSign.tsx`:

```tsx
// The Rótulo's yellow arrow sign, pointing at what both people like. Only the
// overlap ever reaches this screen (backend shared-hobbies.ts); a hobby the
// viewer does not have stays private. The body spans 16–84 % of the height and
// the last 44 px are the arrowhead; the dashed lines sit inside the body.
const ARROW_SHAPE =
  '[clip-path:polygon(0_16%,calc(100%-44px)_16%,calc(100%-44px)_0,100%_50%,calc(100%-44px)_100%,calc(100%-44px)_84%,0_84%)]';

export function CommonGroundSign({ hobbies }: { hobbies: string[] }) {
  if (hobbies.length === 0) return null;
  return (
    <p
      className={`rotulo bg-rotulo-amarillo text-rotulo-tinta before:border-rotulo-tinta/70 relative py-4 pr-14 pl-3.5 text-[13px] before:pointer-events-none before:absolute before:inset-y-[calc(16%+5px)] before:right-12 before:left-1.5 before:border-y before:border-dashed before:content-[''] ${ARROW_SHAPE}`}
    >
      A los dos les gusta: {hobbies.join(' · ')}
    </p>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && npx vitest run src/components/flow-profile && npx tsc --noEmit && npx eslint src/components/flow-profile src/app/layout.tsx`
Expected: PASS. Si `fireEvent.pointerDown` no transporta `clientX` en jsdom, disparar el evento con `new MouseEvent('pointerdown', { clientX, bubbles: true })` vía `fireEvent(group, event)` en el test (el componente no cambia).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/globals.css frontend/src/app/layout.tsx frontend/src/components/flow-profile
git commit -m "feat(flow): feria palette, photo carousel and common-ground sign"
```

---

### Task 5: Pantalla del perfil y ruta `/flow/[token]`

**Files:**
- Create: `frontend/src/components/flow-profile/FlowProfile.tsx`
- Create: `frontend/src/components/flow-profile/FlowProfile.test.tsx`
- Create: `frontend/src/app/flow/[token]/page.tsx`

**Interfaces:**
- Consumes: `OpenFlowProfile` y `useFlowProfile` (Task 3); `PhotoCarousel`, `CommonGroundSign`, clases feria (Task 4); `dateBoardFor(scheduledAt: string): { day: string; time: string }` (`lib/utils/date-board.ts`); `formatSemester` (Task 3); `FlowLoading`, `FlowLinkError`, `FlowStepCompleted` (`components/availability/FlowGuards.tsx`); `PhoneShell`, `Logo`, `ButtonLink`.
- Produces: `<FlowProfile token={string} view={OpenFlowProfile} />`; página pública `/flow/[token]`.

- [ ] **Step 1: Write the failing test**

`frontend/src/components/flow-profile/FlowProfile.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { OpenFlowProfile } from '@/types/flow-profile';
import { FlowProfile } from './FlowProfile';

const VIEW: OpenFlowProfile = {
  step: 'VENUE',
  partner: {
    firstName: 'Miguel',
    age: 24,
    university: 'CES',
    major: 'Psicología',
    semester: '7',
    biography: 'Teatro, cine club y caminatas.',
    photos: ['https://cdn/a.jpg', 'https://cdn/b.jpg'],
  },
  sharedHobbies: ['Teatro'],
  // 26 sept, 7:00 p. m. in Colombia.
  closesAt: '2026-09-27T00:00:00.000Z',
};

describe('FlowProfile', () => {
  it('introduces the partner by first name', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(
      screen.getByRole('heading', { name: 'Conocé a Miguel' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Alguien de CES')).toBeInTheDocument();
    expect(screen.getByText('Miguel, 24')).toBeInTheDocument();
    expect(screen.getByText('Psicología · CES · 7.º sem.')).toBeInTheDocument();
    expect(screen.getByText('A los dos les gusta: Teatro')).toBeInTheDocument();
    expect(screen.getByText('“Teatro, cine club y caminatas.”')).toBeInTheDocument();
  });

  it('sends a link still choosing places to the places step', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.getByRole('link', { name: 'Cuadrar el plan' })).toHaveAttribute(
      'href',
      '/flow/tok/places',
    );
    expect(screen.getByText(/Después elegís lugar y hora\./)).toBeInTheDocument();
  });

  it('sends a link that already has places straight to the hours', () => {
    render(<FlowProfile token="tok" view={{ ...VIEW, step: 'AVAILABILITY' }} />);

    expect(screen.getByRole('link', { name: 'Cuadrar el plan' })).toHaveAttribute(
      'href',
      '/availability/tok',
    );
    expect(screen.getByText(/Después marcás la hora\./)).toBeInTheDocument();
  });

  it('says when the match closes on its own', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(
      screen.getByText(/Si no hacés nada, se cierra solo el sáb 26 sept a las 7:00 p\. m\./),
    ).toBeInTheDocument();
  });

  it('leaves the bio out when it is empty', () => {
    render(
      <FlowProfile
        token="tok"
        view={{ ...VIEW, partner: { ...VIEW.partner, biography: '' } }}
      />,
    );

    expect(screen.queryByText(/“/)).toBeNull();
  });

  it('never calls it a date', () => {
    render(<FlowProfile token="tok" view={VIEW} />);

    expect(screen.queryByText(/cita/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/flow-profile/FlowProfile.test.tsx`
Expected: FAIL — `./FlowProfile` no existe.

- [ ] **Step 3: Write minimal implementation**

`frontend/src/components/flow-profile/FlowProfile.tsx`:

```tsx
import { Logo } from '@/components/shared/Logo';
import { ButtonLink } from '@/components/ui/Button';
import { dateBoardFor } from '@/lib/utils/date-board';
import { formatSemester } from '@/lib/utils/format';
import type { OpenFlowProfile } from '@/types/flow-profile';
import { CommonGroundSign } from './CommonGroundSign';
import { PhotoCarousel } from './PhotoCarousel';

// The screen behind the match SMS: who the person is, before any place or
// hour. It says "plan", never "cita". The button is the only way forward;
// not tapping it is also an answer, and the line under it says so.
export function FlowProfile({
  token,
  view,
}: {
  token: string;
  view: OpenFlowProfile;
}) {
  const { partner, sharedHobbies, step } = view;
  const next = step === 'VENUE' ? `/flow/${token}/places` : `/availability/${token}`;
  const closes = dateBoardFor(view.closesAt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="label border-line bg-surface text-ink-2 inline-flex h-7 items-center rounded-full border px-3">
          Esta semana
        </span>
      </div>
      <div aria-hidden className="feria-stripe" />

      <div className="space-y-2">
        <p className="label text-ink-3">Alguien de {partner.university}</p>
        <h1 className="display text-ink text-[42px]">
          Conocé a {partner.firstName}
        </h1>
      </div>

      {/* The shadow lives on this wrapper: the carousel's clip mask would cut it. */}
      <div className="relative mr-2 mb-3">
        <div className="border-rotulo-crema rounded-[22px] border-[5px] shadow-[8px_8px_0_var(--color-magenta-600)]">
          <PhotoCarousel photos={partner.photos} name={partner.firstName} />
        </div>
        <p className="rotulo bg-magenta-600 text-rotulo-crema absolute bottom-5 -left-2.5 z-10 rounded-[4px_14px_14px_4px] px-4 pt-[7px] pb-1.5 text-[19px] shadow-[4px_4px_0_rgba(0,0,0,0.45)]">
          {partner.firstName}, {partner.age}
        </p>
        <p className="bg-medianoche/60 border-blanco/20 text-blanco absolute top-7 right-3 z-10 max-w-[calc(100%-24px)] truncate rounded-full border px-3 py-1.5 text-xs font-bold">
          {partner.major} · {partner.university} · {formatSemester(partner.semester)}
        </p>
      </div>

      <CommonGroundSign hobbies={sharedHobbies} />

      {partner.biography && (
        <p className="human text-ink text-[19px]">“{partner.biography}”</p>
      )}

      <div className="glass-bar border-line sticky bottom-0 -mx-5 mt-2 border-t px-5 py-4 sm:-mx-7 sm:px-7">
        <ButtonLink href={next} className="w-full">
          Cuadrar el plan
        </ButtonLink>
        <p className="text-ink-3 mt-2.5 text-center text-[12.5px]">
          {step === 'VENUE'
            ? 'Después elegís lugar y hora.'
            : 'Después marcás la hora.'}{' '}
          Si no hacés nada, se cierra solo el {closes.day} a las {closes.time}.
        </p>
      </div>
    </div>
  );
}
```

`frontend/src/app/flow/[token]/page.tsx`:

```tsx
'use client';

import { useParams } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import {
  FlowLinkError,
  FlowLoading,
  FlowStepCompleted,
} from '@/components/availability/FlowGuards';
import { FlowProfile } from '@/components/flow-profile/FlowProfile';
import { useFlowProfile } from '@/hooks/useAvailabilityFlow';

// Entry of the match link: the partner's profile, then places, then hours.
export default function FlowProfilePage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <ProfileContent token={token} />
    </PhoneShell>
  );
}

function ProfileContent({ token }: { token: string }) {
  const { data, isLoading, isError } = useFlowProfile(token);

  if (isLoading) return <FlowLoading label="Buscando a tu match de la semana..." />;
  if (isError) return <FlowLinkError />;
  if (!data || data.step === 'COMPLETED') return <FlowStepCompleted />;
  return <FlowProfile token={token} view={data} />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && npx vitest run src/components/flow-profile && npx tsc --noEmit && npx eslint src/components/flow-profile 'src/app/flow/[token]/page.tsx'`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/flow-profile frontend/src/app/flow
git commit -m "feat(flow): profile screen before places and hours"
```

---

### Task 6: "Plan" en vez de "cita" en el resto del flujo del link

**Files:**
- Modify: `frontend/src/app/flow/[token]/places/page.tsx:38,61-66`
- Modify: `frontend/src/app/availability/[token]/page.tsx:65-68`
- Modify: `frontend/src/components/availability/FlowGuards.tsx:21`
- Modify: `frontend/src/components/cita/DateStation.tsx:8,46,51`
- Modify: `frontend/src/components/dashboard/MatchReveal.tsx:32,64`
- Modify: `frontend/src/components/dashboard/MatchReveal.test.tsx:27`
- Modify: `frontend/src/components/dashboard/MatchCard.tsx:6-7,33`

**Interfaces:**
- Consumes: `firstName` de `@/lib/utils/first-name` (Task 3).

- [ ] **Step 1: Write the failing test**

`MatchReveal.test.tsx:27`:

```tsx
    const dialog = screen.getByRole('dialog', { name: 'Tu plan de esta semana' });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npx vitest run src/components/dashboard/MatchReveal.test.tsx`
Expected: FAIL — el diálogo todavía se llama "Tu cita de esta semana".

- [ ] **Step 3: Write minimal implementation**

`places/page.tsx` — carga, título y bajada (sin el nombre completo):

```tsx
  if (isLoading) return <FlowLoading label="Buscando lugares para el plan..." />;
```

```tsx
          <h1 className="heading text-ink text-4xl">¿Dónde les queda bien?</h1>
          <p className="text-ink-2 mt-2 text-sm">
            Lugares que van con lo que les gusta a los dos. Elegí{' '}
            {data.minSelection} de {data.venues.length}.
          </p>
```

`availability/[token]/page.tsx` — importar `firstName` y cambiar el texto:

```tsx
import { firstName } from '@/lib/utils/first-name';
```

```tsx
            {data.partnerName
              ? `Marcá cuándo podés verte con ${firstName(data.partnerName)}.`
              : 'Marcá cuándo podés.'}{' '}
            Es una hora, entre 12:00 pm y 7:00 pm.
```

`FlowGuards.tsx:21`:

```tsx
      description="Ya completaste este paso. Te avisamos por SMS cuando tu match también termine, para confirmar el plan."
```

`DateStation.tsx` — quitar la constante local `firstName` (línea 8), importar la compartida y cambiar los dos textos:

```tsx
import { firstName } from '@/lib/utils/first-name';
```

```tsx
          Plan confirmado
```

```tsx
        Tu plan con {firstName(partner.name)}
```

`MatchReveal.tsx`:

```tsx
      aria-label="Tu plan de esta semana"
```

```tsx
        <p className="label text-ink-3">Tu plan · esta semana</p>
```

`MatchCard.tsx`:

```tsx
  confirmed: { label: 'Plan confirmado', live: true },
  completed: { label: 'Plan hecho', live: false },
```

```tsx
      <p className="label text-ink-3 mb-3">Tu plan · esta semana</p>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd frontend && npx vitest run && npx tsc --noEmit && npx eslint src/app/flow src/app/availability src/components/availability src/components/cita src/components/dashboard`
Expected: PASS toda la suite.

- [ ] **Step 5: Commit**

```bash
git add 'frontend/src/app/flow/[token]/places/page.tsx' 'frontend/src/app/availability/[token]/page.tsx' frontend/src/components/availability/FlowGuards.tsx frontend/src/components/cita/DateStation.tsx frontend/src/components/dashboard
git commit -m "feat(copy): say plan instead of cita across the match link"
```

---

### Task 7: Docs del repo y verificación de punta a punta

**Files:**
- Modify: `docs/matching/availability-scheduling-flow.md:100-111`
- Modify: `docs/matching/venue-selection-flow.md:17,100,123`
- Modify: `docs/notifications/notifications.md:60,129`

- [ ] **Step 1: Actualizar los docs**

`availability-scheduling-flow.md` — la entrada es el perfil. Reemplazar la línea 100 y agregar la fila y el archivo nuevos:

```md
La URL de entrada del link es `/flow/:token` (perfil primero, después lugares):
```

Primera fila de la tabla:

```md
| `GET`  | `/availability/:token/profile` | **Paso 0.** Perfil del match: primer nombre, edad, U, carrera, semestre, bio, fotos (la principal primero), hobbies en común y `closesAt` (creación + 48 h). Consumido o `DATE` → `COMPLETED`. No cambia el paso del link |
```

Lista de frontend:

```md
- `app/flow/[token]/page.tsx` — **entrada del flujo**: perfil con carrusel de fotos → "Cuadrar el plan" (a lugares, o a horarios si el link ya está en `AVAILABILITY`).
- `app/flow/[token]/places/page.tsx` — paso 1: selección de lugares (reusa `VenueCard`).
```

`venue-selection-flow.md`:

```md
        │   URL de entrada: /flow/:token (perfil) → /flow/:token/places
```

```md
- `app/flow/[token]/places/page.tsx` — paso de lugares; la entrada del link es el perfil (`app/flow/[token]/page.tsx`).
```

```md
node dist/src/scripts/run-weekly-matching.js   # loguea 2 links /flow/<token>
```

`notifications.md` — fila de `match_invite` y ejemplo de consola:

```md
| `match_invite` | Cron semanal / `inviteUser` | `Mourly: esta semana hay alguien para vos. Conocé a {primer nombre}, de {U}: {url}` (el link abre el perfil) |
```

```md
[dev sms] to +573001112233: Mourly: esta semana hay alguien para vos. Conocé a Sofia, de CES: http://localhost:3000/flow/… (Twilio not configured)
```

- [ ] **Step 2: Correr todo**

Run: `cd backend && npx jest && npx tsc --noEmit -p tsconfig.json && npx eslint "src/**/*.ts"`
Expected: PASS, sin errores de lint (sin `--fix`).

Run: `cd frontend && npx vitest run && npx tsc --noEmit && npx eslint src`
Expected: PASS.

- [ ] **Step 3: Probar en el navegador**

Con backend (`mourly-backend-dev`, Twilio vacío) y frontend corriendo, abrir a 390×844 el link de prueba de Felipe sin `/places`: `http://localhost:3000/flow/8hzhqJu8K11VYM85e1QP7LHeXrXatzkjxxJg_H-Llvw`. Verificar: "Conocé a Miguel", las 2 fotos pasan con flechas, "A los dos les gusta: Teatro", el botón lleva a lugares y lugares dice "¿Dónde les queda bien?". Consola sin errores. Captura.

- [ ] **Step 4: Commit**

```bash
git add docs
git commit -m "docs: match link opens the partner's profile first"
```
