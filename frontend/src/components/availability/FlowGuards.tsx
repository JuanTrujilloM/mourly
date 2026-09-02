import { FlowState } from './FlowState';

export function FlowLoading({ label }: { label: string }) {
  return <p className="text-slate animate-pulse text-sm">{label}</p>;
}

export function FlowLinkError() {
  return (
    <FlowState
      emoji="🔗"
      title="Este enlace ya no es válido"
      description="El enlace expiró o ya fue usado. Espera tu próxima notificación de WhatsApp."
    />
  );
}

export function FlowStepCompleted() {
  return (
    <FlowState
      emoji="✅"
      title="¡Listo!"
      description="Ya completaste este paso. Te avisaremos por WhatsApp cuando tu match también termine, para confirmar la cita."
    />
  );
}
