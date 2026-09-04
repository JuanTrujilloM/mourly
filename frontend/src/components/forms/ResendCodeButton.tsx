'use client';

export function ResendCodeButton({
  cooldown,
  isResending,
  notice,
  onResend,
}: {
  cooldown: number;
  isResending: boolean;
  notice: string | null;
  onResend: () => void;
}) {
  return (
    <div className="text-ink-2 text-center text-sm">
      <button
        type="button"
        onClick={onResend}
        disabled={isResending || cooldown > 0}
        className="text-accent-text disabled:text-ink-3 underline tabular-nums disabled:no-underline"
      >
        {cooldown > 0 ? `Reenviar código en ${cooldown} s` : 'Reenviar código'}
      </button>
      {notice && <p className="text-ink-3 mt-1 text-xs">{notice}</p>}
    </div>
  );
}
