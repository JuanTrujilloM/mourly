import type { ReactNode } from 'react';
import { ShellBackButton } from './ShellBackButton';

// Paper on paper: the page is hueso and, from sm up, the app sits in a
// hueso-card sheet with a 1 px line. No photo, no blur, no shadow.
export function PhoneShell({
  children,
  back,
  backHref,
  center,
}: {
  children: ReactNode;
  back?: boolean;
  backHref?: string;
  center?: boolean;
}) {
  const showBack = back || Boolean(backHref);

  return (
    <div className="bg-page flex min-h-[100dvh] w-full flex-1 flex-col items-center justify-center sm:p-6">
      <div className="sm:bg-surface sm:border-line sm:rounded-sheet flex w-full flex-1 flex-col overflow-hidden sm:max-h-[calc(100dvh-3rem)] sm:min-h-[780px] sm:w-[430px] sm:flex-none sm:border">
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
