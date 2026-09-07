import { COMPANY, FOUNDERS } from '@/lib/constants/company';
import { responsibleSection } from './responsible';
import type { LegalDocument } from './types';

export const HABEAS_DATA: LegalDocument = {
  title: 'Aviso de privacidad y habeas data',
  intro:
    'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, le informamos cómo tratamos sus datos personales y cómo puede ejercer sus derechos.',
  version: '1.0',
  updatedAt: '2026-09-06',
  sections: [
    responsibleSection(COMPANY, FOUNDERS),
    {
      heading: 'Finalidades del tratamiento',
      bullets: [
        'Crear y administrar su cuenta, y verificar su vínculo universitario y su mayoría de edad.',
        'Generar propuestas de cita y coordinar encuentros en establecimientos aliados.',
        'Comunicarnos con usted por correo electrónico y WhatsApp sobre el servicio.',
        'Gestionar reportes, moderación y seguridad de la plataforma.',
        'Elaborar estadísticas agregadas y anonimizadas.',
        'Cumplir obligaciones legales y atender requerimientos de autoridad competente.',
      ],
    },
    {
      heading: 'Datos sensibles',
      paragraphs: [
        'Su orientación sexual, su interés de género, sus preferencias de relación y la información contenida en reportes son datos sensibles. Usted no está obligado a autorizar su tratamiento. Esa autorización se solicita de forma separada y puede negarla o revocarla sin que ello afecte el resto de sus derechos.',
      ],
    },
    {
      heading: 'Sus derechos como titular',
      bullets: [
        'Conocer de forma gratuita los datos suyos que hemos tratado.',
        'Actualizar sus datos cuando cambien.',
        'Rectificar los datos inexactos, incompletos o que induzcan a error.',
        'Suprimir sus datos cuando no exista un deber legal o contractual de conservarlos.',
        'Revocar en cualquier momento la autorización otorgada.',
        'Solicitar prueba de la autorización y ser informado del uso que se ha dado a sus datos.',
        'Presentar quejas ante la Superintendencia de Industria y Comercio, una vez agotado el trámite ante Mourly.',
      ],
    },
    {
      heading: 'Canal y plazos',
      paragraphs: [
        `Escriba a ${COMPANY.contactEmail} con el asunto "Habeas Data", indicando su nombre completo, número de documento, el derecho que desea ejercer y una descripción de su solicitud. Atendemos las consultas dentro de los diez (10) días hábiles siguientes a su recibo, prorrogables por cinco (5) días hábiles más, y los reclamos dentro de los quince (15) días hábiles, prorrogables por ocho (8) días hábiles más, informándole previamente los motivos de la prórroga.`,
      ],
    },
    {
      heading: 'Autorización',
      paragraphs: [
        'Al registrarse en Mourly usted autoriza de manera previa, expresa e informada al responsable identificado arriba para recolectar, almacenar, usar, circular y suprimir sus datos personales con las finalidades descritas, y declara que conoce sus derechos y el canal para ejercerlos.',
      ],
    },
    {
      heading: 'Política completa',
      paragraphs: [
        'La Política de tratamiento de datos personales está disponible de forma permanente en mourly.com/privacidad. Cualquier cambio sustancial se informa antes de su entrada en vigencia.',
      ],
    },
  ],
};
