'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AvailabilityToggle } from '@/components/dashboard/AvailabilityToggle';
import { MatchSection } from '@/components/dashboard/MatchSection';
import { useMyProfile } from '@/hooks/useMyProfile';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';

export default function DashboardPage() {
  return <AuthGate>{(user) => <DashboardContent user={user} />}</AuthGate>;
}

function DashboardContent({ user }: { user: AuthUser }) {
  const { data: profile, isLoading } = useMyProfile();

  const status =
    (profile?.status as AvailabilityStatus | undefined) ??
    AVAILABILITY_STATUS.SEARCHING;

  return (
    <>
      <div className="flex items-center justify-between">
        <Logo />
        <LogoutButton />
      </div>

      <MatchSection />

      <div className="mt-6">
        <Card
          title="Tu disponibilidad"
          description="Pausá cuando encuentres a alguien o quieras un descanso."
        >
          {isLoading ? (
            <p className="text-ink-3 text-sm">Cargando...</p>
          ) : (
            <AvailabilityToggle status={status} />
          )}
        </Card>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <ButtonLink href="/perfil" variant="secondary" size="sm">
            Perfil
          </ButtonLink>
          <ButtonLink href="/intereses" variant="secondary" size="sm">
            Intereses
          </ButtonLink>
        </div>
        {user.isAdmin && (
          <ButtonLink href="/admin" variant="ghost" size="sm">
            Panel de administración
          </ButtonLink>
        )}
      </div>
    </>
  );
}
