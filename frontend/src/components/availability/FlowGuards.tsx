import { FlowState } from './FlowState';

export function FlowLoading({ label }: { label: string }) {
  return <p className="text-ink-3 text-sm">{label}</p>;
}

export function FlowLinkError() {
  return (
    <FlowState
      title="Este enlace ya no sirve"
      description="Expiró o ya se usó. Esperá la próxima notificación de WhatsApp."
    />
  );
}

export function FlowStepCompleted() {
  return (
    <FlowState
      title="Listo."
      description="Ya completaste este paso. Te avisamos por WhatsApp cuando tu match también termine, para confirmar la cita."
    />
  );
}
