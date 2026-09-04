'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/admin/PageHeader';

interface MetricSlot {
  label: string;
  hint: string;
}

const METRICS: MetricSlot[] = [
  { label: 'Usuarios totales', hint: 'verificados · activos · en pausa' },
  { label: 'Matches de la semana', hint: 'pendientes · confirmados' },
  { label: 'Citas confirmadas', hint: 'próximas · completadas' },
  { label: 'Tasa de asistencia', hint: 'de las citas con feedback' },
  { label: 'Ingresos por comisión', hint: 'estimado del período' },
  { label: 'Gasto promedio', hint: 'por persona / por cita' },
];

export default function AdminOverviewPage() {
  return (
    <>
      <PageHeader
        title="Resumen de negocio"
        description="Vista general de la operación. Las métricas se conectan en una próxima iteración."
      />

      <div className="border-line bg-surface-2 text-ink-2 rounded-input mb-4 border px-4 py-3 text-sm">
        Plantilla: estas tarjetas son marcadores de posición. La lógica de
        métricas se implementa después.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartPlaceholder title="Matches por estado" />
        <ChartPlaceholder title="Usuarios por universidad" />
      </div>

      <p className="text-ink-2 mt-8 text-sm">
        Mientras tanto, explorá los datos reales en{' '}
        <Link href="/admin/matches" className="text-ink underline">
          Matches
        </Link>
        ,{' '}
        <Link href="/admin/usuarios" className="text-ink underline">
          Usuarios
        </Link>{' '}
        y{' '}
        <Link href="/admin/venues" className="text-ink underline">
          Lugares
        </Link>
        .
      </p>
    </>
  );
}

function MetricCard({ metric }: { metric: MetricSlot }) {
  return (
    <div className="border-line bg-surface rounded-card border p-5">
      <p className="text-ink-2 text-sm font-medium">{metric.label}</p>
      <p className="text-ink-3 mt-2 text-3xl font-bold">—</p>
      <p className="text-ink-3 mt-1 text-xs">{metric.hint}</p>
    </div>
  );
}

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="border-line bg-surface rounded-card border p-5">
      <p className="text-ink text-sm font-semibold">{title}</p>
      <div className="border-line rounded-input mt-4 flex h-40 items-center justify-center border border-dashed">
        <span className="text-ink-3 text-xs">Gráfico pendiente</span>
      </div>
    </div>
  );
}
