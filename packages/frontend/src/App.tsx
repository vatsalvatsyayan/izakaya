import { useSimulationSocket } from './hooks/useSimulationSocket';
import { useDashboardStore } from './store/useDashboardStore';
import { Header } from './components/Header';
import { AssetKPIBar } from './components/AssetKPIBar';
import { HealthBreakdown } from './components/HealthBreakdown';
import { ScenarioProgressBar } from './components/ScenarioProgressBar';
import { TabContainer } from './components/TabContainer';
import { BottomTimeline } from './components/BottomTimeline';
import { AlertToast } from './components/AlertToast';
import { TradeoffModal } from './components/TradeoffModal';
import { ToastContainer } from './components/Toast';
import { DataCenterScene } from './three/DataCenterScene';
import { ComponentDetailPanel } from './components/ComponentDetailPanel';
import { CommunityBurdenIndicator } from './components/CommunityBurdenIndicator';

export default function App() {
  useSimulationSocket();
  const mode = useDashboardStore((s) => s.mode);

  return (
    <>
      <div className="min-viewport-warning">
        <p>Please use a desktop browser with a window at least 1280×720</p>
      </div>

      <div className="h-screen flex flex-col overflow-hidden bg-[#0f1117]">
        {/* Spec §6: Simulation mode banner — full width, top of viewport */}
        {mode === 'simulation' && (
          <div style={{
            background: '#3B82F6',
            color: 'white',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.05em',
            padding: '4px 0',
            flexShrink: 0,
            zIndex: 200,
          }}>
            SIMULATION MODE — Changes are not committed
          </div>
        )}
        {/* Spec §4.2: Reconnecting amber banner */}
        <ReconnectingBanner />

        {/* Header */}
        <Header />

        {/* KPI Bar */}
        <AssetKPIBar />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: 3D Viewer */}
          <div className="w-[55%] relative overflow-hidden">
            <DataCenterScene />
            <AlertToast />
            {/* Community Burden — pinned bottom-left of the 3D viewer */}
            <div className="absolute bottom-0 left-0 z-10">
              <CommunityBurdenIndicator />
            </div>
          </div>

          {/* Right: Panel system */}
          <div className="w-[45%] flex flex-col border-l border-[#2d3148] bg-[#1e2133] overflow-hidden">
            <HealthBreakdown />
            <ComponentDetailPanel />
            <ScenarioProgressBar />
            <TabContainer />
          </div>
        </div>

        {/* Bottom Timeline */}
        <BottomTimeline />
      </div>

      <TradeoffModal />
      <ToastContainer />
    </>
  );
}

// Spec §4.2: amber "Reconnecting…" banner shown during disconnect
function ReconnectingBanner() {
  const status = useDashboardStore((s) => s.connectionStatus);
  if (status !== 'reconnecting' && status !== 'disconnected') return null;
  return (
    <div style={{
      background: '#78350F',
      borderBottom: '1px solid #F59E0B',
      color: '#F59E0B',
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '0.06em',
      padding: '3px 0',
      flexShrink: 0,
      zIndex: 199,
    }}>
      {status === 'reconnecting' ? 'Reconnecting…' : 'Connection lost — retrying'}
    </div>
  );
}
