# Disponibilidad, lugares, confirmación y aceptación/rechazo

> Alcance: el flujo que va **después** de que se genera el match semanal, hasta que
> queda una cita agendada o el match se recicla. Cubre las historias:
> **HU-09** (disponibilidad), **HU-06** (lugares), **HU-08** (confirmación por
> coincidencia) y **HU-07** (aceptar/rechazar).
>
> Las notificaciones de este flujo salen por **SMS** (Twilio; sin credenciales se
> **loguean en consola**) vía `NotificationsService`. El correo solo entra con
> `EMAIL_NOTIFICATIONS_ENABLED=true`. Ver
> [notifications.md](../notifications/notifications.md) y
> [SMS: por qué va por consola](#sms-dev-mode).

---

## 1. Panorama

```
Jueves 7pm (cron) → se crean los Match
        │
        ▼
Se emite 1 link tokenizado por usuario  →  SMS (dev: log en consola)
        │
        ▼   (el usuario abre el link, SIN login)
HU-06 Lugares → HU-09 Disponibilidad        [flujo público, mismo token]
        │
        ▼   (cuando el 2º usuario termina)
HU-08 tryConfirm: ¿coinciden horario + lugar?
        ├── Sí  → crea Date (status accepted), Match pasa a confirmed, avisa a ambos
        └── No  → 1 empujón para agregar disponibilidad (solo horarios; los
                  lugares elegidos se conservan) → si sigue sin cruce, recicla

HU-07 (en paralelo, por el chatbot):
        ├── "no me interesa" → reject_match → Match rejected, se borra la Date, recicla
        └── 48h sin respuesta → timeout → Match rejected (por sistema)
```

**Aceptación = implícita**: completar lugares + disponibilidad *es* aceptar. Solo el
**rechazo** y el **timeout** se manejan explícitamente.

> Detalle de la selección de lugares (generación de las 3 opciones, regla "2 de 3",
> por qué ambos ven los mismos lugares): [venue-selection-flow.md](./venue-selection-flow.md).

---

## 2. Módulos y responsabilidades

| Módulo | Rol |
|---|---|
| `matches` | Motor semanal (existente) + **invitación** (`MatchInviteService`), **confirmación** (`MatchConfirmationService`), **aceptar/rechazar** (`MatchResponseService`) |
| `availability-link` | Ciclo de vida del token del link (`AvailabilityLinkService`): emitir, validar, avanzar de paso, consumir. sha256, uso único, expiración |
| `availability` | Flujo público por token: calendario, guardar disponibilidad, reusar HU-06 para lugares (`AvailabilityService` + `AvailabilityController`) |
| `notifications` + `sms` | `NotificationsService` reparte a `SmsChannel` (Twilio, o consola sin credenciales) y, solo con flag, a `EmailChannel` |
| `chatbot` | Cerebro entrante. Nueva herramienta `reject_match` |

---

## 3. Modelo de datos

**`AvailabilityLink`** (nuevo) — el "magic link" público:

```
id, matchId, userId, tokenHash (sha256 @unique), step ('VENUE'|'AVAILABILITY'),
expiresAt, consumedAt?, createdAt   @@unique([matchId, userId])
```

El `step` arranca en `VENUE` (lugares primero), pasa a `AVAILABILITY` al guardar
los lugares y el link se consume al guardar los horarios. Los links del empujón
se emiten directamente en `AVAILABILITY`.

**`Match`** (columnas nuevas):

```
scheduleAttempts Int @default(0)   // HU-08: nº de empujones enviados (tope 1)
scheduleDeadline DateTime?         // HU-08: fecha límite para reciclar
rejectedById     String?           // HU-07: quién rechazó (null = timeout del sistema)
rejectedAt       DateTime?         // HU-07: cuándo (analítica, AC6)
```

**`Availability`** (existente, antes sin usar): una fila por franja seleccionada,
`date` (`@db.Date`) + `timeSlot` (hora de inicio `"12:00".."18:00"`).

### Vocabulario de estados (una palabra por entidad)

| Entidad | Estados |
|---|---|
| **Match** | `pending → confirmed → completed` (+ `rejected`, `expired`) |
| **Date** | **solo `accepted`** |

- `Match.confirmed` = tiene cita agendada. `Date.accepted` = la cita nació aceptada
  (porque completar el flujo es aceptar).
- `rejected` (rechazo explícito o timeout) y `expired` (falla de agendamiento) son del
  **Match**, no del Date. Al rechazar, la Date **se borra**.

---

## 4. Flujo público por token (HU-09 + HU-06)

Rutas **públicas** (sin `JwtAuthGuard`) — el token en la URL es la credencial.
La URL de entrada del link es `/flow/:token` (perfil primero, después lugares):

| Método | Ruta | Qué hace |
|---|---|---|
| `GET`  | `/availability/:token/profile` | **Paso 0.** Perfil del match: primer nombre, edad, U, carrera, semestre, bio, fotos (la principal primero), hobbies en común y `closesAt` (creación + 48 h). Consumido o `DATE` → `COMPLETED`. No cambia el paso del link |
| `GET`  | `/availability/:token/venues` | **Paso 1.** Sugerencias de lugares (reusa `MatchesService`). Si el paso ya es `AVAILABILITY`, señaliza redirigir a horarios; consumido → `COMPLETED` |
| `POST` | `/availability/:token/venues` | Guarda la selección (exactamente 2 de 3), avanza el link a `AVAILABILITY` |
| `GET`  | `/availability/:token` | **Paso 2.** Valida y devuelve el calendario (7 días, slots 12pm–7pm). Si el paso es `VENUE`, señaliza volver a lugares; consumido → `COMPLETED` |
| `POST` | `/availability/:token` | Valida (≥1 slot, dentro de la ventana), guarda `Availability`, **consume el link**, dispara `tryConfirm` |

Frontend (fuera de `AuthGate`):
- `app/flow/[token]/page.tsx` — **entrada del flujo**: perfil con carrusel de fotos → "Cuadrar el plan" (a lugares, o a horarios si el link ya está en `AVAILABILITY`).
- `app/flow/[token]/places/page.tsx` — paso 1: selección de lugares (reusa `VenueCard`).
- `app/availability/[token]/page.tsx` — paso final: calendario + pantalla "¡Listo!" / estados de error.

Re-abrir un link consumido muestra una pantalla amable de completado (los `GET`
devuelven `{ step: 'COMPLETED' }`); los `POST` responden 410.

**Regla "2 de 3"**: cada usuario elige **exactamente 2** de las 3 opciones. Dos
subconjuntos de 2 en un set de 3 siempre se cruzan → siempre hay un lugar en común
(principio del palomar). Validado en el DTO (`min = max = 2`) y en ambas UIs.

---

## 5. Confirmación (HU-08)

`MatchConfirmationService.tryConfirm(matchId)` se llama al final de
`submitAvailability` (el último paso del flujo). Es idempotente y no hace nada
hasta que **ambos** completaron el flujo.

```
1. Si ya hay Date → salir.  Si el match no está activo → salir.
2. bothCompleted? (ambos con disponibilidad + ambos con 2 lugares) → si no, "waiting".
3. commonSlot = franja más temprana presente en las listas de A y B.
   commonVenue = lugar con userASelected && userBSelected (siempre existe por "2 de 3").
4. Hay commonSlot y commonVenue:
      crea Date (status accepted) + Match → confirmed   [en una transacción]
      avisa a ambos con día/hora/lugar
   No hay coincidencia de horario:
      - Si ya se empujó (scheduleAttempts ≥ 1) → recicla (Match → expired, avisa)
      - Si no → empuja: reabre disponibilidad (link nuevo emitido en paso
        AVAILABILITY: los lugares elegidos se conservan y NO se repiten),
        scheduleDeadline = +24h, avisa
```

- `scheduledAt` = día (`@db.Date`, UTC-midnight) + hora del slot → UTC usando el offset
  fijo de Colombia (UTC-5, sin DST).
- **Cron horario** (`recycleExpired`): recicla matches empujados cuyo `scheduleDeadline`
  venció sin cita (el usuario nunca respondió al empujón).

---

## 6. Aceptar / Rechazar (HU-07)

- **Aceptar** = implícito (completar el flujo). No hay tabla ni columna de "accepted";
  se deriva de tener `Availability` + `VenueOption` seleccionados.
- **Rechazar** = por el chatbot. Nueva herramienta `reject_match` (sin parámetros,
  atada al `userId`). El agente la llama cuando el usuario dice claramente que no
  quiere el match. `MatchResponseService.reject`:
  - marca `Match.status = rejected`, guarda `rejectedById` + `rejectedAt`,
  - **borra la Date** si existía,
  - avisa al **otro** usuario, y ambos reingresan al pool (el matcher solo excluye
    `pending`/`confirmed`).
- **Timeout 48h** (AC5): `@Cron` horario (`rejectStaleMatches`) marca como `rejected`
  (por sistema, `rejectedById = null`) los matches sin cita 48h después de crearse, y
  avisa a ambos.

---

## 7. SMS: por qué va por consola {#sms-dev-mode}

Las notificaciones son **salientes** (las dispara el sistema) y van por SMS. El
chatbot es **solo entrante** y todavía no tiene transporte (se moverá a la app web).

- `SmsModule` elige `ConsoleSmsSender` cuando `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
  o el origen (`TWILIO_MESSAGING_SERVICE_SID` / `TWILIO_FROM`) están vacíos: cada SMS
  se **loguea en consola** como `[dev sms] to +57…: …`.
- Las respuestas del chatbot se prueban con el REPL `chat-repl.js` (también consola).

---

## 8. Variables de entorno

```bash
FRONTEND_URL=http://localhost:3000     # base para armar el link del token
AVAILABILITY_LINK_TTL_HOURS=72         # vigencia del link de disponibilidad
TWILIO_ACCOUNT_SID=                    # vacío = modo dev (loguea en vez de enviar)
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=          # o TWILIO_FROM (número en E.164)
TWILIO_FROM=
OPENROUTER_API_KEY=                    # requerido para el chatbot (rechazo por chat)
```

---

## 9. Scripts útiles (`backend`, tras `npm run build`)

| Comando | Qué hace |
|---|---|
| `npm run db:seed` | Siembra usuarios/venues. **Sin matches** por defecto (pool listo para el matcher). `SEED_MATCHES=true npm run db:seed` para los matches de demo |
| `node dist/src/scripts/run-weekly-matching.js` | Corre el matcher + invita (loguea 2 links por match) |
| `node dist/src/scripts/issue-availability-link.js [matchId]` | Re-emite e imprime los 2 links de un match (por defecto, el último) |
| `node dist/src/scripts/chat-repl.js <cellphone>` | Habla con el chatbot como ese usuario (requiere `OPENROUTER_API_KEY`) |

---

## 10. Cómo probar (end-to-end)

> Requisitos: Postgres arriba, migraciones aplicadas (`npx prisma migrate deploy`),
> backend y frontend corriendo. **Si editas backend, reinicia el server** — el watch a
> veces no recompila tras regenerar el cliente de Prisma.

### Preparar
```bash
cd backend
npm run db:seed
node dist/src/scripts/run-weekly-matching.js   # crea matches + loguea 2 links por match
```
Copia **los 2 links de un mismo match** (aparecen juntos por celular en el log).

### Caso feliz — Date `accepted` + Match `confirmed`
1. Abre el link del usuario A → **primero los lugares**: elige 2 → confirmar.
2. Pasa al calendario → elige una franja (ej. `mié 8 · 13:00`) → continuar → "¡Listo!".
3. Repite con el link del usuario B usando 2 lugares y **la misma franja**.
4. Al terminar B: en consola aparece `[dev sms] ... coincidieron ... Cita confirmada ...`.
5. Verifica en `npx prisma studio`: la `Date` queda `status = accepted` y el `Match`
   `status = confirmed`.

### Sin coincidencia de horario — empujón
- Igual que arriba pero con **franjas distintas** (A: 13:00, B: 15:00). Al terminar B:
  consola `... no cuadraron ... sumar franjas ...` + **un link nuevo por usuario**.
- Los links nuevos abren **directo el calendario** (los lugares ya elegidos se
  conservan; el paso de lugares no se repite).
- Vuelve a elegir franjas distintas → segundo fallo → consola
  `... no logramos cuadrar ...` y el `Match` queda `expired`.

### Rechazo por chatbot (HU-07)
```bash
node dist/src/scripts/chat-repl.js +573001000008
you> no me interesa este match, quiero rechazarlo
```
- El **otro** usuario recibe `[dev sms] ... no sigue adelante ...`.
- El `Match` queda `rejected` con `rejectedById`/`rejectedAt`, y la `Date` se borró.
- Requiere `OPENROUTER_API_KEY`.

### Timeout 48h
- Es un `@Cron` horario. Para forzarlo: baja `RESPONSE_TIMEOUT_HOURS` a `0` en
  `match-response.constants.ts` (o atrasa `createdAt` de un match `pending` sin cita en
  la DB) y espera al barrido. Resultado: `Match` → `rejected` (por sistema), ambos avisados.

### Link inválido / expirado (HU-09 AC5)
- Abre `http://localhost:3000/availability/tokenfalso` → vista "Este enlace ya no es válido".
- Un link ya usado o con `AVAILABILITY_LINK_TTL_HOURS=0` → mismo mensaje.

---

## 11. Tests automatizados

Unitarios (Jest) que cubren la lógica crítica:

- `availability-link.service.spec` — emisión (guarda solo el hash), validación
  (`ok/invalid/expired/consumed`), uso único, avance de paso.
- `availability.service.spec` — calendario (7 días, slots), guardado, rechazo de
  fechas/slots inválidos y duplicados, mapeo de errores a 404/410, reuso de HU-06.
- `weekly-matching.integration.spec` — el match generado dispara las sugerencias de lugar.

Ejecutar: `cd backend && npx jest`.
