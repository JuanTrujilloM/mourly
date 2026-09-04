import type { ReactNode } from 'react';
import { ShellBackButton } from './ShellBackButton';

// Paper on paper: the page is hueso and, from sm up, the app sits in a
// hueso-card sheet with a 1 px line. No photo, no blur, no shadow.
// `app` pins the shell to the viewport so the tabbed shell scrolls per panel
// (flex-none: as a body flex item, flex-1 would let content override the height).
// The page scroller carries no bottom padding: sticky bottom-0 pins to the
// scroller's content box, so padding here would lift a sticky bar off the
// sheet's edge. Pages add their own bottom air (pb-10) instead.
export function PhoneShell({
  children,
  back,
  backHref,
  center,
  variant = 'page',
}: {
  children: ReactNode;
  back?: boolean;
  backHref?: string;
  center?: boolean;
  variant?: 'page' | 'app';
}) {
  const showBack = back || Boolean(backHref);
  const app = variant === 'app';

  return (
    <div
      className={`bg-page flex w-full flex-col items-center justify-center sm:p-6 ${
        app ? 'h-[100dvh] flex-none' : 'min-h-[100dvh] flex-1'
      }`}
    >
      <div
        className={`sm:bg-surface sm:border-line sm:rounded-sheet flex w-full flex-1 flex-col overflow-hidden sm:w-[430px] sm:flex-none sm:border ${
          app
            ? 'min-h-0 sm:h-[calc(100dvh-3rem)]'
            : 'sm:max-h-[calc(100dvh-3rem)] sm:min-h-[780px]'
        }`}
      >
        {app ? (
          children
        ) : (
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-5 pt-6 sm:px-7">
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
        )}
      </div>
    </div>
  );
}
