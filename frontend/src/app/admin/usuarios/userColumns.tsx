"use client";

import type { Column } from "@/components/admin/DataTable";
import { Badge, UserStatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils/format";
import type { AdminUser } from "@/types/admin";
import { UserRowActions } from "./UserRowActions";

export interface UserActions {
  onStatusChange: (id: string, status: string) => void;
  onVerify: (id: string) => void;
  isBusy: boolean;
}

export function userColumns(actions: UserActions): Column<AdminUser>[] {
  return [
    {
      header: "Estudiante",
      cell: (user) => (
        <div>
          <span className="text-cream font-medium">
            {user.profile?.name ?? "—"}
          </span>
          <p className="text-slate mt-0.5 text-xs">{user.email}</p>
        </div>
      ),
    },
    {
      header: "Universidad",
      cell: (user) =>
        user.profile ? (
          <div>
            <span className="text-cream">{user.profile.university}</span>
            <p className="text-slate mt-0.5 text-xs">
              {user.profile.major} · sem {user.profile.semester}
            </p>
          </div>
        ) : (
          <span className="text-slate text-xs">Sin perfil</span>
        ),
    },
    {
      header: "Edad",
      cell: (user) => (
        <span className="text-cream">{user.profile?.age ?? "—"}</span>
      ),
    },
    {
      header: "Matches",
      className: "text-right",
      cell: (user) => <span className="text-cream">{user.matchCount}</span>,
    },
    {
      header: "Estado",
      cell: (user) => (
        <div className="flex flex-wrap gap-1.5">
          {user.profile ? (
            <UserStatusBadge status={user.profile.status} />
          ) : null}
          {user.isVerified ? (
            <Badge label="Verificado" tone="green" />
          ) : (
            <Badge label="Sin verificar" tone="gold" />
          )}
        </div>
      ),
    },
    {
      header: "Registro",
      cell: (user) => (
        <span className="text-slate text-xs">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (user) => <UserRowActions user={user} actions={actions} />,
    },
  ];
}
