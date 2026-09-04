"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminUsers } from "@/hooks/useAdminData";
import { useSetUserStatus, useVerifyUser } from "@/hooks/useAdminActions";
import { userColumns } from "./userColumns";

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers();
  const setStatus = useSetUserStatus();
  const verify = useVerifyUser();

  const columns = userColumns({
    onStatusChange: (id, status) => setStatus.mutate({ id, status }),
    onVerify: (id) => verify.mutate(id),
    isBusy: setStatus.isPending || verify.isPending,
  });

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Estudiantes registrados, su perfil y su estado de búsqueda."
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Todavía no hay usuarios registrados."
      />
    </>
  );
}
