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
  retirar pendientes, crear, reclamar intento, consumir) con una implementación
  delgada por tabla. Correo borra los pendientes al retirarlos; teléfono los
  marca con `consumedAt` y conserva la fila, que es lo que cuenta la cuota diaria.
- `VerificationCodeIssuerService(prisma, table, ttlMinutes)` — bloquea la fila del
  usuario, aplica `decideResend` (60 s de espera, máximo 3 reenvíos), reemplaza el
  código pendiente.
- `VerificationCodeService(prisma, table)` — valida (expirado, 5 intentos, bcrypt) y
  consume. Cada intento se reclama antes del bcrypt con un `updateMany` condicionado a
  `attempts < 5`: peticiones en paralelo no pueden pasarse del límite, y un reclamo
  perdido responde "demasiados intentos" aunque el código sea correcto.
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

`CandidateLoaderService` exige `cellphoneVerifiedAt` no nulo y `isReviewAccount`
falso. `Recipient.cellphone`
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

---

## 9. Cuenta revisora (revisión de anuncios de Meta u otra plataforma)

Un revisor externo no tiene correo institucional ni línea colombiana. Mientras dure
la revisión, **un** correo entra con un código fijo de seis dígitos y salta el SMS.

**Abrir la revisión**

1. En `api.env` (VM) poner las dos variables y reiniciar el API:
   `REVIEW_ACCOUNT_EMAIL=revision@mourly.com`, `REVIEW_ACCOUNT_CODE=482913`.
   El API no arranca si falta una, si el código no tiene seis dígitos exactos o si el
   correo está en `ADMIN_EMAILS` (`review-account-env.rules.ts`).
2. Pasarle al revisor el correo, el código y un celular colombiano **del equipo**:
   se guarda verificado sin SMS y queda tomado para cualquier otra cuenta.

**Qué hace el API**

- `POST /auth/request-code` acepta ese correo aunque su dominio no sea universitario,
  guarda el código fijo (bcrypt, como cualquier otro) y no manda correo.
  `ReviewAccountService` lo ignora si el dominio del correo está en la tabla
  `University` (activa o no): así el código nunca abre la cuenta de un estudiante.
- El `upsert` marca la fila con `isReviewAccount = true`. La marca no se borra:
  `CandidateLoaderService` saca esas cuentas del matching aunque las variables ya no
  estén.
- `PATCH /auth/phone` estampa `cellphoneVerifiedAt` sin SMS solo si la fila está
  marcada **y** las variables siguen apuntando a ese correo.
  `PHONE_SMS_VERIFICATION_ENABLED` no se toca.
- Fuerza bruta: un reenvío del código fijo hereda los intentos del código vivo que
  reemplaza y solo vuelve a cero cuando ese código vence. Son 5 intentos por TTL
  (unos 720 al día), sumados al `AUTH_THROTTLE` por IP. Quien conozca el correo puede
  bloquear al revisor durante un TTL como mucho.

**Cerrar la revisión**

1. Quitar `REVIEW_ACCOUNT_EMAIL` y `REVIEW_ACCOUNT_CODE` y reiniciar el API.
2. Como admin, `POST /admin/review-account/close`. En una transacción revoca los
   refresh tokens de las cuentas marcadas, pone su perfil en `PAUSED` y borra los
   códigos de correo pendientes. Responde los conteos y `reviewLoginStillOpen`, que
   sigue en `true` mientras las variables existan.
3. El access token (15 min) que el revisor ya tenga sigue valiendo hasta vencer.

No hay match de demo: el revisor ve el onboarding completo y la cuenta regresiva al
siguiente matching.
