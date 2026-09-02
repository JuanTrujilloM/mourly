import Image from 'next/image';
import type { ReactNode } from 'react';
import appBackdrop from '@/assets/app-backdrop.png';
import { ShellBackButton } from './ShellBackButton';

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
    <div className="relative flex min-h-[100dvh] w-full flex-1 flex-col items-center justify-center sm:p-6">
      <div aria-hidden className="fixed inset-0 overflow-hidden">
        <Image
          src={appBackdrop}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
        <div className="bg-navy-deep/45 absolute inset-0" />
        <div className="from-navy-deep/70 via-transparent to-navy-deep/70 absolute inset-0 bg-gradient-to-b" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col overflow-hidden border-white/10 bg-[rgba(10,37,64,0.85)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:min-h-[780px] sm:w-[430px] sm:flex-none sm:rounded-[2.5rem] sm:border">
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
