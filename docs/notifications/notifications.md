# Notificaciones (SMS + correo)

> Alcance: los mensajes salientes del ciclo de matching — el invite con el magic
> link (HU-05), la confirmación de la cita (HU-08), el empujón de disponibilidad,
> el rechazo (HU-07), el reciclaje y la encuesta post-cita (HU-10). El flujo de
> negocio vive en
> [availability-scheduling-flow.md](../matching/availability-scheduling-flow.md).
>
> **SMS es el canal por defecto** (Twilio). WhatsApp se descartó porque Meta no
> permite apps de citas en su plataforma. El **correo** queda reservado al código
> de verificación mientras se recupera la reputación del dominio frente a los
> filtros de las universidades; las notificaciones por correo siguen en el código
> detrás de `EMAIL_NOTIFICATIONS_ENABLED`.

---

## 1. Panorama

```
MatchInviteService ─────────┐
MatchConfirmationService ───┤
MatchReschedulerService ────┼──> NotificationsService ──┬──> SmsChannel ──> SMS_SENDER
MatchResponseService ───────┤        (fan-out,          │     (Twilio | consola)
FeedbackWindowService ──────┘        Promise.allSettled) └──> EmailChannel ──> MailService
                                                              (solo si EMAIL_NOTIFICATIONS_ENABLED=true)
```

Los servicios de `matches` y `feedback` inyectan `NotificationsService` y le
entregan un objeto `Notification` (unión discriminada por `kind`). Cada canal
renderiza ese objeto a su formato: texto plano para SMS, plantilla HTML para
correo.

---

## 2. Módulos y responsabilidades

| Pieza | Rol |
|---|---|
| `notifications/notifications.service.ts` | Fan-out a los canales activos con `Promise.allSettled`. Loguea fallas; nunca lanza |
| `notifications/channel-selection.ts` | Decide qué canales van: SMS siempre; correo solo con `EMAIL_NOTIFICATIONS_ENABLED=true` |
| `notifications/channels/sms.channel.ts` | Normaliza el celular a E.164 (`+57…`) y manda el texto de `sms-messages.ts` |
| `notifications/sms-messages.ts` | Copy de los 7 SMS. Voseo, sin emojis, ≤160 caracteres en alfabeto GSM-7 |
| `notifications/gsm-text.ts` | Reemplaza `á í ó ú` y `·` en nombres, lugares y horarios: fuera de GSM-7 el SMS pasa a UCS-2 (70 chars por segmento) |
| `notifications/channels/email.channel.ts` | Renderiza la plantilla HTML (`email-content.ts`) y llama a `MailService.send()` |
| `sms/sms-sender.ts` | Token `SMS_SENDER` + interfaz `SmsSender { send(to, body) }` |
| `sms/twilio-sms-sender.ts` | Implementación real: `client.messages.create({ from \| messagingServiceSid, to, body })` |
| `sms/console-sms-sender.ts` | Modo dev: loguea `[dev sms] to +57…: …` |
| `sms/sms.module.ts` | Elige Twilio cuando hay SID, token y origen; si no, consola con un aviso al arrancar |
| `mail/mail.service.ts` | Resend (HTTPS). `send(to, { subject, html, text? })` con `Reply-To`; `sendVerificationCode()` para HU-01 |

---

## 3. Los 7 SMS

Todos empiezan con `Mourly:` porque el remitente aparece como un número
internacional (Colombia no soporta sender ID alfanumérico).

| `kind` | Disparador | Texto |
|---|---|---|
| `match_invite` | Cron semanal / `inviteUser` | `Mourly: tenés match esta semana con {nombre}. Escogé lugares y horarios: {url}` |
| `date_proposal` | Cruce de horario + lugar (la cita ya quedó confirmada) | `Mourly: coincidieron con {nombre}. Cita confirmada: {cuándo} en {lugar}. ¡Que la disfruten!` |
| `more_availability` | Sin cruce, primer intento | `Mourly: tus horarios no cuadraron con {nombre}. Podés sumar franjas: {url}` |
| `feedback_request` | 24h después de la cita | `Mourly: ¿te encontraste con {nombre} en {lugar}? Contanos qué tal estuvo.` |
| `feedback_reminder` | Último aviso antes de cerrar la encuesta | `Mourly: no nos contaste de tu cita con {nombre} en {lugar}. Después de esto cerramos la encuesta: ¿qué tal estuvo?` |
| `match_rejected` | La otra persona rechazó | `Mourly: tu match de esta semana no sigue adelante. Te buscamos otro la semana que viene. ¡No te desanimes!` |
| `rescheduling_failed` | Segundo fallo de agendamiento | `Mourly: no logramos cuadrar una cita esta vez. Te buscamos otro match la semana que viene. ¡No te desanimes!` |

Los links miden ~74 caracteres (token de 43). Con un nombre de hasta ~21
caracteres el invite cabe en un segmento; nombres más largos producen dos
segmentos, igual se entregan. `sms-messages.spec.ts` verifica largo y alfabeto.

Las plantillas de correo (`mail/templates/*.template.ts`) no cambiaron y vuelven
a usarse al activar el flag.

---

## 4. Aislamiento de fallas

`NotificationsService.send()` usa `Promise.allSettled` y loguea cada rechazo con
el nombre del canal y el `kind`:

- Un canal caído no bloquea al otro.
- El dispatcher nunca lanza: la confirmación de la cita ya hizo commit cuando
  notifica; una falla de envío no la deshace.
- `TwilioSmsSender` deja propagar el error del proveedor (código y mensaje de
  Twilio quedan en el log).

---

## 5. Variables de entorno

```bash
# SMS (Twilio). Vacío = modo dev: cada SMS se loguea en consola.
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=   # tiene prioridad sobre TWILIO_FROM
TWILIO_FROM=                    # número en E.164, p. ej. +15005550006

# Correo (Resend). Vacío = modo dev: los correos se loguean en consola.
RESEND_API_KEY=
MAIL_FROM="Mourly <no-reply@mourly.com>"
MAIL_REPLY_TO=cloud@mourly.com
EMAIL_NOTIFICATIONS_ENABLED=false   # true para volver a mandar notificaciones por correo

FRONTEND_URL=http://localhost:3000     # base del magic link
AVAILABILITY_LINK_TTL_HOURS=72         # TTL del token
```

Los celulares se guardan como los escribió la persona (`3001234567` o
`+573001234567`); `toE164Colombia()` los normaliza al enviar.

---

## 6. Scripts útiles (`backend`, tras `npm run build`)

| Comando | Qué hace |
|---|---|
| `node dist/src/scripts/preview-emails.js [dir]` | Renderiza las plantillas de correo (incluido el código de verificación) a HTML con datos de ejemplo, sin enviar nada |
| `node dist/src/scripts/issue-availability-link.js [matchId]` | Re-emite los links de un match y dispara el invite por los canales activos |
| `node dist/src/scripts/run-weekly-matching.js` | Matcher completo + invites |

---

## 7. Cómo probar

### Modo dev (sin Twilio)
Con `TWILIO_ACCOUNT_SID` vacío, cada envío aparece en consola:
```
[dev sms] to +573001112233: Mourly: tenés match esta semana con Sofia Gomez. Escogé lugares y horarios: http://localhost:3000/flow/…/places (Twilio not configured)
```
Dispara los flujos como en
[availability-scheduling-flow.md §10](../matching/availability-scheduling-flow.md):
seed → `run-weekly-matching` → completar los dos flujos de token.

### Con Twilio real
Configura las cuatro variables y repite con un celular colombiano. Antes de
subir a `main` (despliega solo) manda un invite real a números de Claro, Tigo y
Movistar y confirma que el link llega sin filtrar.

---

## 8. Tests automatizados

- `notifications/sms-messages.spec.ts`: cada `kind` cabe en 160 caracteres GSM-7,
  el link va literal, la cita se anuncia como confirmada.
- `notifications/gsm-text.spec.ts`: mapeo de acentos y del punto medio.
- `notifications/channel-selection.spec.ts`: el correo solo entra con `'true'`.
- `notifications/channels/channels.spec.ts`: `SmsChannel` normaliza a E.164.
- `sms/*.spec.ts`: origen (servicio vs número), normalización, sender de Twilio
  con el SDK mockeado, sender de consola.

Ejecutar: `cd backend && npx jest src/modules/notifications src/modules/sms`.
