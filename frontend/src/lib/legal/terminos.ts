import { COMPANY, FOUNDERS } from '@/lib/constants/company';
import { responsibleSection } from './responsible';
import type { LegalDocument } from './types';

// Every claim here describes what the product does today. Ley 1480 makes the
// website binding, so features that do not exist yet must not appear.
export const TERMINOS: LegalDocument = {
  title: 'Términos y condiciones',
  intro:
    'Estos términos regulan el uso de Mourly, en mourly.com y en su canal de WhatsApp. Al crear una cuenta usted declara que los leyó y los acepta.',
  version: '1.0',
  updatedAt: '2026-09-06',
  sections: [
    responsibleSection(COMPANY, FOUNDERS),
    {
      heading: 'Qué es Mourly',
      paragraphs: [
        'Mourly es un intermediario tecnológico que facilita la coordinación de un encuentro entre dos personas adultas en un establecimiento abierto al público. Mourly no acompaña la cita, no supervisa la conducta de quienes asisten ni asume su custodia.',
        'Prometemos un proceso, no un resultado: una propuesta por semana, un lugar y una hora concretos y un canal de reporte. No prometemos compatibilidad, afinidad ni que una cita salga bien.',
      ],
    },
    {
      heading: 'Requisitos para usar Mourly',
      bullets: [
        'Tener al menos 18 años. No hay excepciones.',
        'Tener un correo institucional vigente de una universidad soportada (EAFIT, UPB, CES o EIA) y un número de celular propio con WhatsApp.',
        'Mantener un solo perfil por persona.',
      ],
    },
    {
      heading: 'Mourly no es un proyecto universitario',
      paragraphs: [
        'Mourly no es un proyecto académico, un trabajo de grado, una práctica ni una iniciativa de ninguna universidad. Mourly no está afiliada, patrocinada, avalada, administrada ni supervisada por EAFIT, UPB, CES, EIA ni por ninguna otra institución de educación superior. Sus nombres se mencionan únicamente para identificar la comunidad a la que usted pertenece.',
        'El correo institucional se usa solo como mecanismo técnico para verificar que usted tiene un vínculo vigente con una universidad. Su universidad no recibe sus datos, no tiene acceso a su perfil y no participa en el servicio.',
      ],
    },
    {
      heading: 'Su cuenta',
      bullets: [
        'Usted responde por la veracidad de la información, las fotos y la biografía que publica.',
        'Mourly puede pedir verificaciones adicionales, suspender o cancelar una cuenta cuando existan indicios de información falsa, suplantación o incumplimiento de estos términos.',
        'Usted puede eliminar su cuenta en cualquier momento. El efecto sobre sus datos se describe en la Política de tratamiento de datos.',
      ],
    },
    {
      heading: 'Qué verificamos y qué no',
      bullets: [
        'Verificamos que usted controla el correo institucional con el que se registra, mediante un código enviado a ese correo.',
        'Registramos la fecha de nacimiento que usted declara y rechazamos a quien declare menos de 18 años. No verificamos la identidad contra un documento.',
        'No verificamos antecedentes, intenciones ni la veracidad de fotos o biografías. Ninguna verificación de Mourly sustituye su propio criterio.',
      ],
    },
    {
      heading: 'Conducta prohibida',
      bullets: [
        'Acosar, amenazar, insultar o presionar a otra persona, dentro o fuera de la plataforma.',
        'Suplantar a otra persona o publicar fotos o datos que no le pertenecen.',
        'Contactar a alguien por fuera de Mourly sin su consentimiento, o insistir tras una negativa.',
        'Crear más de una cuenta, ceder la suya o usar Mourly con fines comerciales.',
        'Mourly puede suspender o cancelar la cuenta sin previo aviso cuando exista un reporte verosímil. La expulsión persiste aunque se cree una cuenta nueva.',
      ],
    },
    {
      heading: 'Sobre las citas presenciales',
      paragraphs: [
        'La decisión de asistir a una cita, permanecer en ella o retirarse en cualquier momento es enteramente suya. Al aceptar una cita usted reconoce que Mourly solo facilita el encuentro en un lugar público y que la conducta durante la cita es responsabilidad de quienes participan en ella.',
        'Lo que hacemos y usted puede exigirnos:',
      ],
      bullets: [
        'Verificamos que cada cuenta corresponda a un correo institucional vigente de una universidad soportada.',
        'Exigimos mayoría de edad para registrarse.',
        'Fijamos la cita en un establecimiento abierto al público, nunca en un domicilio.',
        'Mantenemos un canal de reporte disponible antes, durante y después de la cita.',
      ],
    },
    {
      heading: 'Lo que no prometemos',
      paragraphs: [
        'No garantizamos la identidad, las intenciones, los antecedentes ni la conducta de ninguna persona. Ninguna de las medidas descritas garantiza que una cita esté libre de riesgo. Usted asiste bajo su propia decisión y responsabilidad.',
      ],
    },
    {
      heading: 'Recomendaciones y emergencias',
      bullets: [
        'Comparta con alguien de confianza dónde y con quién estará.',
        'Llegue y regrese por sus propios medios.',
        'No deje su bebida desatendida ni acepte bebidas que no haya visto servir.',
        'Si algo le incomoda, retírese. No le debe una explicación a nadie.',
        'Si está en peligro, llame al 123. En Medellín, la Línea 123 Mujer atiende violencias basadas en género.',
        'Si ocurrió algo durante o después de una cita, repórtelo en Mourly.',
      ],
    },
    {
      heading: 'Reportes',
      paragraphs: [
        'Cualquier persona puede reportar a otra antes, durante o después de una cita. Los reportes son confidenciales, nunca se muestran a la persona reportada y solo los revisa el equipo de Mourly. Cuando un reporte revele un posible delito investigable de oficio, Mourly tiene el deber legal de ponerlo en conocimiento de la autoridad competente (artículo 67 del Código de Procedimiento Penal).',
      ],
    },
    {
      heading: 'Lugares aliados',
      paragraphs: [
        'Los establecimientos donde se realizan las citas son terceros independientes. Mourly no responde por la calidad de su servicio ni por la seguridad de sus instalaciones. Lo que usted consuma lo paga directamente al establecimiento.',
      ],
    },
    {
      heading: 'Precio y pagos',
      paragraphs: [
        'Mourly le informa cualquier cobro antes de aplicarlo, con su valor, periodicidad y forma de cancelación. Mientras no exista un cobro informado y aceptado por usted, no hay obligación de pago.',
      ],
    },
    {
      heading: 'Propiedad intelectual',
      paragraphs: [
        'La marca, el software y el contenido de Mourly pertenecen a sus titulares. Sobre las fotos y textos que usted publica, otorga a Mourly una licencia limitada, no exclusiva y revocable para mostrarlos a la persona con la que se le propone una cita y para operar el servicio. La licencia termina cuando elimina el contenido o su cuenta.',
      ],
    },
    {
      heading: 'Responsabilidad',
      paragraphs: [
        'Mourly responde por el funcionamiento del servicio que describe en estos términos. Mourly no responde por la conducta de otras personas usuarias ni de los establecimientos aliados. Nada en estos términos limita la responsabilidad de Mourly por dolo o culpa grave ni los derechos irrenunciables que la ley colombiana reconoce a los consumidores.',
      ],
    },
    {
      heading: 'Terminación y cambios',
      bullets: [
        'Usted puede dejar de usar Mourly y eliminar su cuenta en cualquier momento.',
        'Mourly puede modificar estos términos. Los cambios sustanciales se informan por correo o WhatsApp antes de entrar en vigencia, con la fecha visible en este documento.',
      ],
    },
    {
      heading: 'Peticiones, quejas, reclamos y ley aplicable',
      paragraphs: [
        `Escriba a ${COMPANY.contactEmail}. Respondemos dentro de los quince (15) días hábiles siguientes. Si no queda conforme, puede acudir a la Superintendencia de Industria y Comercio. Estos términos se rigen por la ley colombiana y cualquier controversia se resuelve ante los jueces de Medellín, sin perjuicio de los mecanismos que la Ley 1480 de 2011 reconoce a los consumidores.`,
      ],
    },
  ],
};
