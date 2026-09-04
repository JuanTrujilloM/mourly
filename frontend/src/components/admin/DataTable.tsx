import type { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  isError,
  emptyMessage = 'No hay datos para mostrar.',
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div className="border-line bg-surface rounded-card overflow-x-auto border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-line border-b">
            {columns.map((column) => (
              <th
                key={column.header}
                className={`label text-ink-3 px-4 py-3 ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <StateRow span={columns.length} text="Cargando..." />
          ) : isError ? (
            <StateRow
              span={columns.length}
              text="No se pudo cargar la información."
            />
          ) : !rows || rows.length === 0 ? (
            <StateRow span={columns.length} text={emptyMessage} />
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-line hover:bg-surface-2 border-b transition last:border-0"
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`text-ink px-4 py-3 align-middle ${column.className ?? ''}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StateRow({ span, text }: { span: number; text: string }) {
  return (
    <tr>
      <td colSpan={span} className="text-ink-3 px-4 py-10 text-center text-sm">
        {text}
      </td>
    </tr>
  );
}
