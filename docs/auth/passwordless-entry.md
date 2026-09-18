# Entrada sin contraseña y verificación de celular

> Alcance: cómo entra una persona a Mourly (HU-01) y cómo se valida su celular
> antes del onboarding. Reemplaza el par registro/login que existía antes.
> Notificaciones salientes: [notifications.md](../notifications/notifications.md).

---

## 1. Panorama

```
/login  correo ──> POST /auth/request-code ──> upsert User por email
                                             └─> código por correo (segundo plano)
/verify código ──> POST /auth/verify ──> isVerified = true + sesión (cookies)
        │
        ▼  nextRouteFor(user)
/onboarding/celular ──> PATCH /auth/phone { cellphone }   (guarda +57…, borra códigos)
                    ──> POST  /auth/phone/send            (SMS con el código)
                    ──> POST  /auth/phone/verify { code } (cellphoneVerifiedAt)
        │
        ▼
/onboarding/perfil → /onboarding/intereses → /dashboard
```

Registro e inicio de sesión son la misma acción: pedir un código al correo.
Si el correo es de una universidad soportada, la cuenta se crea en ese momento
(`upsert`), así que **siempre** sale un código y nadie queda esperando uno que
no existe. Cuentas que nunca verifican el correo se borran a los 7 días
(`UnverifiedAccountCleanupService`, cron diario 4 am con job-claim).

---

## 2. Rutas

| Método | Ruta | Guard | Qué hace |
|---|---|---|---|
| `POST` | `/auth/request-code` | rate limit | Valida dominio, `upsert` por correo normalizado, despacha el código por correo en segundo plano, responde `CODE_SENT_MESSAGE` |
| `POST` | `/auth/verify` | rate limit | Valida el código de correo, marca `isVerified`, emite cookies de sesión |
| `PATCH` | `/auth/phone` | JWT | Normaliza a E.164, rechaza un número de otra cuenta, guarda y resetea `cellphoneVerifiedAt` y los códigos pendientes |
| `POST` | `/auth/phone/send` | JWT | Emite un código (misma política que el correo) y lo manda por `SMS_SENDER`; 429 si el issuer lo rechaza |
| `POST` | `/auth/phone/verify` | JWT | Valida el código y estampa `cellphoneVerifiedAt`; devuelve el usuario seguro |

`GET /auth/me` expone `cellphone` (puede ser `null`) y `cellphoneVerified`.

---

## 3. Códigos: una sola lógica, dos tablas

`EmailVerificationCode` y `PhoneVerificationCode` tienen la misma forma. La
lógica vive una sola vez:

- `verification-code-table.ts` — interfaz `VerificationCodeTable` (leer pendiente,
  borrar pendientes, crear, contar intento, consumir) con una implementación
  delgada por tabla.
- `VerificationCodeIssuerService(prisma, table, ttlMinutes)` — bloquea la fila del
  usuario, aplica `decideResend` (60 s de espera, máximo 3 reenvíos), reemplaza el
  código pendiente.
- `VerificationCodeService(prisma, table)` — valida (expirado, 5 intentos, bcrypt) y
  consume.
- `verification.providers.ts` — registra dos instancias de cada uno con los tokens
  `EMAIL_CODE_ISSUER`, `EMAIL_CODE_VALIDATOR`, `PHONE_CODE_ISSUER`,
  `PHONE_CODE_VALIDATOR`. TTL: `EMAIL_CODE_TTL_MINUTES` y `PHONE_CODE_TTL_MINUTES`
  (10 por defecto).

---

## 4. Frontend

- `/login` — `EmailEntryForm`: un solo campo; universidad no soportada abre la lista
  de espera; línea de aceptación de términos. `/register` redirige acá.
- `/verify` — `VerificationForm`: afirma que el código se envió, muestra el
  cooldown recordado en `sessionStorage`, y al verificar navega con
  `nextRouteFor(user)`.
- `/onboarding/celular` — `PhoneVerificationForm`: paso de número
  (`CellphoneStep`) cuando no hay celular o se quiere cambiar; paso de código
  (`PhoneCodeStep`) que manda el SMS al abrir si no hay cooldown activo.
- Gate central: `useRequireAuth` redirige a `/login` sin sesión y a
  `/onboarding/celular` mientras `cellphoneVerified` sea falso (cubre cuentas
  viejas en su próxima visita). `useRedirectIfAuthenticated` manda a
  `nextRouteFor(user)`.
- Pantallas de carga: `Splash` (wordmark con el punto orbitando) en los gates y el
  flujo por token; `SplashOverlay` se desvanece al resolver.

---

## 5. Pool semanal y notificaciones

`CandidateLoaderService` exige `cellphoneVerifiedAt` no nulo. `Recipient.cellphone`
puede ser `null` en tipos; `SmsChannel` rechaza esos envíos con un error que el
fan-out loguea (en la práctica nadie llega a un match sin celular verificado).

---

## 6. Cómo probar en local

```bash
cd backend && npm run db:seed          # estudiantes con celular verificado
# Sin RESEND_API_KEY ni TWILIO_*: los códigos salen por consola
#   [dev mail] to ana@eafit.edu.co: "482913 es tu código de ingreso a Mourly"
#   [dev sms] to +573001112233: Mourly: 482913 es tu código de verificación. …
```

1. Abrir `/login`, escribir un correo institucional nuevo, copiar el código del log.
2. Verificar → aterriza en `/onboarding/celular`; escribir el celular, copiar el
   código del log, verificar → `/onboarding/perfil`.
3. Cerrar sesión y volver a entrar con el mismo correo: mismo flujo, sin paso de
   celular.

Tests: `cd backend && npx jest src/modules/auth && npm run test:e2e`,
`cd frontend && npm test`.
