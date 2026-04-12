import { useDashboardStore } from '../store/useDashboardStore';

export function ScenarioProgressBar() {
  const activeScenario = useDashboardStore((s) => s.simulationState.activeScenario);
  const progress = useDashboardStore((s) => s.scenarioProgress);

  if (!activeScenario || !progress) return null;

  const percent = Math.round((progress.ticksElapsed / Math.max(1, progress.totalTicks)) * 100);
  const isComplete = progress.phase === 'complete';

  let tierClasses: string;
  if (percent <= 33) {
    tierClasses = 'text-yellow-400 bg-yellow-950/30 border-yellow-600/30';
  } else if (percent <= 66) {
    tierClasses = 'text-orange-400 bg-orange-950/30 border-orange-600/30';
  } else {
    tierClasses = 'text-red-400 bg-red-950/30 border-red-600/30';
  }
  const barColor = percent <= 33 ? 'bg-yellow-500' : percent <= 66 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className={`h-6 flex items-center px-3 text-xs border ${tierClasses} flex-shrink-0`}>
      <span className="mr-2">⚡</span>
      <span className="font-mono">{activeScenario}</span>
      <span className="mx-2 text-slate-600">|</span>
      <span>{isComplete ? 'COMPLETE' : `Phase ${Math.ceil(Math.max(1, percent) / 25)}/4`}</span>
      <span className="mx-2 text-slate-600">|</span>
      <div className="w-24 h-1 bg-[#252840] rounded overflow-hidden">
        <div className={`h-full rounded ${barColor} transition-all`} style={{ width: `${percent}%` }} />
      </div>
      <span className="ml-2 font-mono">{percent}%</span>
    </div>
  );
}
