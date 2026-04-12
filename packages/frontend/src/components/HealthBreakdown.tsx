import { useDashboardStore } from '../store/useDashboardStore';

const HEALTH_COMPONENTS = [
  { key: 'power', label: 'Power' },
  { key: 'cooling', label: 'Cooling' },
  { key: 'gpu', label: 'GPU' },
  { key: 'workload', label: 'Workload' },
  { key: 'location', label: 'Location' },
];

export function HealthBreakdown() {
  const layers = useDashboardStore((s) => s.simulationState.layers);
  const selected = useDashboardStore((s) => s.selectedHealthComponent);
  const setSelected = useDashboardStore((s) => s.setSelectedHealthComponent);

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2d3148] overflow-x-auto flex-shrink-0">
      {HEALTH_COMPONENTS.map(({ key, label }) => {
        const health = (layers as Record<string, { health?: string }>)[key]?.health as string;
        const isSelected = selected === key;
        const dotColor = health === 'healthy' ? 'bg-green-500'
          : health === 'warning' ? 'bg-yellow-500' : 'bg-red-500';

        return (
          <button
            key={key}
            onClick={() => setSelected(isSelected ? null : key)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors whitespace-nowrap ${
              isSelected
                ? 'ring-1 ring-sky-500/60 bg-sky-900/40 text-sky-300'
                : 'text-slate-400 hover:bg-[#252840]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
