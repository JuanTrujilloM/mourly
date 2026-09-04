import { Badge, UserStatusBadge } from '@/components/admin/StatusBadge';
import type { AdminUserDetail } from '@/types/admin';
import { Fact } from './primitives';

export function UserCard({
  user,
  shared,
}: {
  user: AdminUserDetail;
  shared: Set<string>;
}) {
  return (
    <div className="border-line bg-surface rounded-card border p-5">
      <div className="flex items-center gap-4">
        {user.primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.primaryPhoto}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="bg-surface-2 text-ink flex h-16 w-16 items-center justify-center rounded-full text-xl">
            {user.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="subheading text-ink truncate text-lg">{user.name}</h3>
            {user.age != null && (
              <span className="text-ink-2 text-sm">{user.age}</span>
            )}
          </div>
          <p className="text-ink-2 mt-0.5 truncate text-xs">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {user.status && <UserStatusBadge status={user.status} />}
            {user.isVerified ? (
              <Badge label="Verificado" tone="live" />
            ) : (
              <Badge label="Sin verificar" tone="muted" />
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Fact label="Universidad" value={user.university} />
        <Fact label="Carrera" value={user.major} />
        <Fact label="Semestre" value={user.semester} />
        <Fact label="Género" value={user.gender} />
        <Fact
          label="Estatura"
          value={user.height ? `${user.height} cm` : null}
        />
      </dl>

      {user.biography && (
        <p className="human text-ink-2 mt-3 text-[18px]">“{user.biography}”</p>
      )}

      <div className="mt-4">
        <p className="label text-ink-3 mb-2">Intereses</p>
        <div className="flex flex-wrap gap-1.5">
          {user.hobbies.map((hobby) => {
            const isShared = shared.has(hobby.toLowerCase());
            return (
              <span
                key={hobby}
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  isShared ? 'bg-ink text-page font-medium' : 'bg-surface-2 text-ink-2'
                }`}
              >
                {hobby}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
