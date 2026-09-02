import type { ReactNode } from 'react';
import { ShellBackButton } from './ShellBackButton';

// Phone-shell layout for every in-app view (auth, onboarding, dashboard).
// Midnight backdrop: near-black navy with soft radial glow blobs and a film
// grain overlay, with a centered glass phone-frame card floating on top,
// ditto-style. On real phones the frame expands to fill the viewport; the
// framed look is a tablet/desktop enhancement.
// Pass `backHref` for a fixed back target, or `back` to walk browser history.
// Pass `center` for short content (e.g. auth forms) that should sit vertically
// centered in the card instead of anchored to the top with blank space below.
export function PhoneShell({
  children,
  back,
  backHref,
  center,
  cornerGlow,
}: {
  children: ReactNode;
  back?: boolean;
  backHref?: string;
  center?: boolean;
  // Coral ambient glow anchored to the frame's top-left corner (dashboard hero).
  cornerGlow?: boolean;
}) {
  const showBack = back || Boolean(backHref);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-1 flex-col items-center justify-center sm:p-6">
      {/* Full-screen backdrop. Painted first in DOM order (no negative z-index)
          since fixed elements with a negative z-index can paint behind the
          document background in some browsers. */}
      <div aria-hidden className="bg-navy-deep fixed inset-0 overflow-hidden">
        <div className="animate-float-slow absolute -top-[14%] -left-[24%] h-[52%] w-[78%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,89,0.4),transparent_68%)] blur-2xl" />
        <div className="animate-float absolute top-[6%] -right-[26%] h-[50%] w-[78%] bg-[radial-gradient(circle_at_50%_50%,rgba(57,198,221,0.3),transparent_66%)] blur-2xl" />
        <div className="absolute -bottom-[18%] left-[8%] h-[52%] w-[90%] bg-[radial-gradient(circle_at_50%_50%,rgba(120,90,220,0.24),transparent_70%)] blur-3xl" />
        <div className="from-navy-deep/40 via-navy-deep/70 to-navy-deep/95 absolute inset-0 bg-gradient-to-b" />
        <div className="grain" />
      </div>

      {/* Phone frame: glass card, full-bleed on mobile, framed from sm up.
          backdrop-blur only from sm: it creates a containing block that would
          trap the dashboard's fixed bottom nav inside the scrolling frame. */}
      <div className="bg-navy/90 relative z-10 flex w-full flex-1 flex-col overflow-hidden border-white/10 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] sm:max-h-[calc(100dvh-3rem)] sm:min-h-[780px] sm:w-[430px] sm:flex-none sm:rounded-[2.875rem] sm:border sm:backdrop-blur-2xl">
        {/* Painted between the frame's navy bg and the (transparent) scroll
            column via -z-10, so they light the corners without tinting content:
            coral top-left, teal top-right. */}
        {cornerGlow && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 -left-6 -z-10 h-72 w-72 bg-[radial-gradient(circle_at_top_left,rgba(255,122,89,0.45),transparent_68%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-6 -right-6 -z-10 h-72 w-72 bg-[radial-gradient(circle_at_top_right,rgba(57,198,221,0.4),transparent_68%)]"
            />
          </>
        )}
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-5 pt-6 pb-10 sm:px-7">
          {showBack && (
            <div className="mb-4 shrink-0">
              <ShellBackButton href={backHref} />
            </div>
          )}
          <div
            className={
              center ? 'flex flex-1 flex-col justify-center' : 'flex-1'
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
