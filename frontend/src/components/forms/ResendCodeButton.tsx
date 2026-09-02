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
    <div className="text-slate text-center text-sm">
      <button
        type="button"
        onClick={onResend}
        disabled={isResending || cooldown > 0}
        className="text-cyan underline disabled:text-slate disabled:no-underline disabled:opacity-50"
      >
        {cooldown > 0 ? `Reenviar código en ${cooldown}s` : 'Reenviar código'}
      </button>
      {notice && <p className="text-slate mt-1 text-xs">{notice}</p>}
    </div>
  );
}
