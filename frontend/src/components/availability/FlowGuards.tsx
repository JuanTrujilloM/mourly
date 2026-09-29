import { Splash } from '@/components/shared/Splash';
import { FlowState } from './FlowState';

export function FlowLoading({ label }: { label: string }) {
  return <Splash label={label} />;
}

export function FlowLinkError() {
  return (
    <FlowState
      title="Este enlace ya no sirve"
      description="Expiró o ya se usó. Esperá el próximo SMS."
    />
  );
}

export function FlowStepCompleted() {
  return (
    <FlowState
      title="Listo."
      description="Ya completaste este paso. Te avisamos por SMS cuando tu match también termine, para confirmar el plan."
    />
  );
}
