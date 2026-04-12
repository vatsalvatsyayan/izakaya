import { useSimulationSocket } from './hooks/useSimulationSocket';
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

export default function App() {
  useSimulationSocket();

  return (
    <>
      <div className="min-viewport-warning">
        <p>Please use a desktop browser with a window at least 1280×720</p>
      </div>

      <div className="h-screen flex flex-col overflow-hidden bg-[#0f1117]">
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
