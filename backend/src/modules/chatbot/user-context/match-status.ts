export const ACTIVE_MATCH_STATUSES = ['pending', 'confirmed'] as const;

export function matchStatusLabel(
  status: string,
  hasConfirmedDate: boolean,
): string {
  switch (status) {
    case 'pending':
      return 'Pendiente de aceptación';
    case 'confirmed':
      return hasConfirmedDate ? 'Cita agendada' : 'Aceptado';
    case 'completed':
      return 'Cita realizada';
    case 'canceled':
      return 'Cancelado';
    case 'rejected':
      return 'Rechazado';
    case 'expired':
      return 'No agendado a tiempo';
    default:
      return status;
  }
}
