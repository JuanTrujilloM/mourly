import { COMPANY, FOUNDERS } from '@/lib/constants/company';
import { responsibleSection } from './responsible';
import type { LegalDocument } from './types';

// Data inventory mirrors prisma/schema.prisma; security claims are limited to
// what is actually in place (no audit log or at-rest encryption is promised).
export const PRIVACIDAD: LegalDocument = {
  title: 'Política de tratamiento de datos personales',
  intro:
    'Esta política explica qué datos recoge Mourly, para qué los usa, con quién los comparte y cómo puede usted ejercer sus derechos, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
  version: '1.0',
  updatedAt: '2026-09-06',
  sections: [
    responsibleSection(COMPANY, FOUNDERS),
    {
      heading: 'Mourly no es un proyecto universitario',
      paragraphs: [
        'Mourly no está afiliada, patrocinada, avalada ni supervisada por ninguna universidad. El correo institucional se usa únicamente para verificar que usted tiene un vínculo vigente con una universidad soportada. Su universidad no recibe sus datos, no tiene acceso a su perfil y no participa en el tratamiento de su información. Mourly no compartirá información con su universidad salvo que exista un convenio previo, usted lo autorice de forma expresa y separada, o medie una orden de autoridad competente.',
        'No dirija solicitudes sobre sus datos a su universidad: no es el responsable y no puede atenderlas.',
      ],
    },
    {
      heading: 'Datos que tratamos',
      bullets: [
        'Identificación y contacto: nombre, correo institucional, número de celular (WhatsApp) y fecha de nacimiento.',
        'Académicos: universidad, carrera y semestre.',
        'Perfil: género, estatura, biografía, hobbies e intereses, y las fotos que usted sube.',
        'Datos sensibles: los géneros que le interesan (que, junto con su propio género, pueden revelar su orientación sexual), el tipo de relación que busca, y la información que usted registre en un reporte sobre otra persona. Mourly no pregunta ni almacena una etiqueta de orientación sexual.',
        'Actividad: propuestas de cita, disponibilidad horaria, citas confirmadas y su feedback posterior (si ocurrió, calificación, comentarios, motivo de inasistencia y gasto aproximado).',
        'Conversaciones con el asistente de Mourly en WhatsApp.',
        'Técnicos: dirección IP, dispositivo y registros de acceso.',
      ],
    },
    {
      heading: 'Datos sensibles: su autorización es libre y separada',
      paragraphs: [
        'Los géneros que le interesan, sus preferencias de relación y la información de los reportes son datos sensibles (artículo 5 de la Ley 1581 de 2012), porque pueden revelar su orientación sexual. Usted no está obligado a autorizar su tratamiento y su negativa no le impide crear una cuenta ni ejercer sus derechos. Sin embargo, la función de emparejamiento no puede operar sin esta información: si no la autoriza, su cuenta permanece activa pero no recibe propuestas de cita.',
        'La autorización para datos sensibles se solicita de forma separada de la aceptación de los Términos y condiciones, y puede revocarla en cualquier momento escribiendo al canal indicado arriba.',
      ],
    },
    {
      heading: 'Para qué usamos sus datos',
      bullets: [
        'Crear y administrar su cuenta, y verificar su vínculo universitario y su mayoría de edad.',
        'Generar una propuesta de cita por semana y coordinar día, hora y lugar.',
        'Comunicarnos con usted por correo y WhatsApp sobre el servicio.',
        'Atender reportes, moderar la plataforma y proteger la seguridad de las personas usuarias.',
        'Elaborar estadísticas agregadas y anonimizadas para mejorar el servicio.',
        'Cumplir obligaciones legales y atender requerimientos de autoridad competente.',
      ],
    },
    {
      heading: 'Decisiones automatizadas',
      paragraphs: [
        'La propuesta de cita semanal se calcula de forma automatizada a partir de intereses y hobbies en común, tipo de relación, carrera y semestre, biografía, preferencias de estatura, vibe y el historial de asistencia a citas anteriores. Ninguna decisión automatizada le impide usar el servicio. Puede pedir que una persona del equipo revise una propuesta o su ausencia.',
      ],
    },
    {
      heading: 'Con quién compartimos sus datos',
      bullets: [
        'Encargados del tratamiento que operan por cuenta de Mourly: el proveedor de nube (Amazon Web Services) para servidores y fotos, Meta (WhatsApp) para la mensajería, el proveedor de correo transaccional y el proveedor del modelo de lenguaje que responde en el asistente de WhatsApp.',
        'Lugares aliados: reciben únicamente el nombre de pila de las dos personas y la hora de la reserva.',
        'Autoridades: solo por orden de autoridad competente, con registro de cada entrega.',
        'Mourly no vende sus datos ni los comparte con fines publicitarios de terceros.',
      ],
    },
    {
      heading: 'Transferencia internacional',
      paragraphs: [
        'Los servidores de nuestros proveedores están fuera de Colombia, principalmente en Estados Unidos. Al autorizar el tratamiento usted autoriza de manera expresa esta transferencia, que se realiza con proveedores que ofrecen garantías contractuales de protección de datos.',
      ],
    },
    {
      heading: 'Cuánto tiempo conservamos sus datos',
      bullets: [
        'Perfil, preferencias y fotos: mientras su cuenta esté activa y hasta treinta (30) días después de que la elimine.',
        'Reportes y registros asociados a un reporte: dos (2) años, o mientras exista una investigación o requerimiento abierto.',
        'Feedback de citas: de forma anonimizada y agregada, sin límite de tiempo.',
        'Cuando exista un reporte o un requerimiento de autoridad, el borrado se suspende hasta que concluya.',
      ],
    },
    {
      heading: 'Seguridad',
      bullets: [
        'Conexiones cifradas (HTTPS) entre su dispositivo y nuestros servidores.',
        'Acceso por rol: los datos sensibles y los reportes solo los ve el personal que los necesita.',
        'Los reportes nunca se muestran a la persona reportada.',
        'Si ocurre un incidente de seguridad que afecte sus datos, se lo notificaremos y lo informaremos a la Superintendencia de Industria y Comercio.',
      ],
    },
    {
      heading: 'Menores de edad',
      paragraphs: [
        'Mourly es exclusivamente para mayores de 18 años. No tratamos deliberadamente datos de menores. Si detectamos que una cuenta pertenece a un menor, la eliminamos junto con sus datos de inmediato.',
      ],
    },
    {
      heading: 'Sus derechos',
      bullets: [
        'Conocer, actualizar y rectificar sus datos.',
        'Solicitar prueba de la autorización otorgada y ser informado del uso que se les ha dado.',
        'Revocar la autorización y solicitar la supresión de sus datos cuando no exista un deber legal o contractual de conservarlos.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio una vez agotado el trámite ante Mourly.',
      ],
    },
    {
      heading: 'Cómo ejercerlos',
      paragraphs: [
        `Escriba a ${COMPANY.contactEmail} con el asunto "Habeas Data", indicando su nombre completo, número de documento, el derecho que desea ejercer y una descripción de su solicitud. Atendemos las consultas dentro de los diez (10) días hábiles siguientes, prorrogables por cinco (5) más, y los reclamos dentro de los quince (15) días hábiles, prorrogables por ocho (8) más, informándole antes los motivos de la prórroga.`,
      ],
    },
    {
      heading: 'Cookies',
      paragraphs: [
        'mourly.com no usa cookies de terceros ni herramientas de analítica. La aplicación usa únicamente las cookies necesarias para mantener su sesión iniciada. Si esto cambia, actualizaremos esta política antes de hacerlo.',
      ],
    },
    {
      heading: 'Vigencia',
      paragraphs: [
        'Esta política rige desde la fecha indicada al inicio. Los cambios sustanciales se informan por correo o WhatsApp antes de entrar en vigencia.',
      ],
    },
  ],
};
