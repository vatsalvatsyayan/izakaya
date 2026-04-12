import { useDashboardStore } from '../store/useDashboardStore';
import { sendWsMessage } from '../hooks/useSimulationSocket';

const SPEEDS = [1, 10, 30, 60, 100, 200];

export function SpeedControl() {
  const speedMultiplier = useDashboardStore((s) => s.speedMultiplier);
  const setSpeedMultiplier = useDashboardStore((s) => s.setSpeedMultiplier);

  function handleSpeed(speed: number) {
    setSpeedMultiplier(speed);
    sendWsMessage('speed:set', { speed });
  }

  return (
    <div className="flex items-center gap-1">
      {SPEEDS.map((speed) => {
        const active = speedMultiplier === speed;
        return (
          <button
            key={speed}
            onClick={() => handleSpeed(speed)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              active
                ? 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1 ring-offset-[#1a1d27]'
                : 'bg-[#252840] text-slate-400 hover:bg-[#2d3148]'
            }`}
          >
            {speed}x
          </button>
        );
      })}
    </div>
  );
}
