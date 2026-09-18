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
/onboarding/celular ──> PATCH /auth/phone { cellphone }   (guarda +57…, agota códigos)
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
| `PATCH` | `/auth/phone` | JWT | Normaliza a E.164. Mismo número: no toca nada. Número verificado por otra cuenta: 400. Si no, se lo quita a cualquier cuenta que lo tenga sin verificar, guarda, resetea `cellphoneVerifiedAt` y agota los códigos pendientes (no los borra, así la espera y el tope siguen corriendo) |
| `POST` | `/auth/phone/send` | JWT | Máximo 10 SMS por usuario en 24 h (`PhoneCodeQuotaService`), luego la misma política que el correo; manda a `toE164Colombia(cellphone)` por `SMS_SENDER`; 429 si la cuota o el issuer lo rechazan |
| `POST` | `/auth/phone/verify` | JWT | Valida el código y estampa `cellphoneVerifiedAt`; devuelve el usuario seguro |

`GET /auth/me` expone `cellphone` (puede ser `null`) y `cellphoneVerified`.

---

## 3. Códigos: una sola lógica, dos tablas

`EmailVerificationCode` y `PhoneVerificationCode` tienen la misma forma. La
lógica vive una sola vez:

- `verification-code-table.ts` — interfaz `VerificationCodeTable` (leer pendiente,
  retirar pendientes, crear, contar intento, consumir) con una implementación
  delgada por tabla. Correo borra los pendientes al retirarlos; teléfono los
  marca con `consumedAt` y conserva la fila, que es lo que cuenta la cuota diaria.
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

## 6. Modo sin SMS (`PHONE_SMS_VERIFICATION_ENABLED=false`)

Temporal, mientras la cuenta de Twilio está en verificación.

- `PATCH /auth/phone` guarda el número y estampa `cellphoneVerifiedAt` en el acto;
  responde `{ cellphone, cellphoneVerified: true }` y el frontend sigue sin pedir código.
- Sigue rechazando un número que otra cuenta ya verificó.
- En producción Twilio deja de ser obligatorio, pero `EMAIL_NOTIFICATIONS_ENABLED`
  tiene que ser `true` para que los avisos de match y cita salgan por correo.
- La migración `20260918020000_trust_registered_cellphones` da por verificados los
  números cargados en el registro anterior, así esas cuentas no quedan esperando un SMS.
- Para volver al SMS: cargar `TWILIO_*`, poner la variable en `true` y reiniciar. Los
  números ya verificados quedan verificados; para forzar a todos a confirmar por SMS:
  `UPDATE "User" SET "cellphoneVerifiedAt" = NULL;`

---

## 7. Límites contra abuso de SMS

- 60 s entre códigos y 3 reenvíos por código (`decideResend`), que sobreviven a un
  cambio de número porque `PATCH /auth/phone` agota los códigos en vez de borrarlos.
- 10 SMS por usuario en 24 h (`DAILY_PHONE_CODE_LIMIT`).
- `AUTH_THROTTLE` por IP en las tres rutas.
- En producción el API no arranca sin `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y
  `TWILIO_MESSAGING_SERVICE_SID` o `TWILIO_FROM` (`env.validation.ts`).
- Los celulares guardados antes de E.164 se pasan a `+57…` en la migración
  `20260918010000_normalize_cellphones`.

---

## 8. Cómo probar en local

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
