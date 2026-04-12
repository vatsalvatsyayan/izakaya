import { useSimulationSocket } from './hooks/useSimulationSocket';
import { useDashboardStore } from './store/useDashboardStore';
import { MetricsTopBar } from './components/MetricsTopBar';
import { LayerSidebar } from './components/LayerSidebar';
import { RightPanel } from './components/RightPanel';
import { ActionPanel } from './components/ActionPanel';
import { TradeoffModal } from './components/TradeoffModal';
import { ToastContainer } from './components/Toast';
import { SimulationBanner } from './components/SimulationBanner';
import { DataCenterScene } from './three/DataCenterScene';

export default function App() {
  useSimulationSocket();
  const mode = useDashboardStore((s) => s.mode);
  const connectionStatus = useDashboardStore((s) => s.connectionStatus);
  const selectedLayer = useDashboardStore((s) => s.selectedLayer);

  return (
    <>
      <div className="min-viewport-warning">
        <p>Please use a desktop browser with a window at least 1280×720</p>
      </div>

      <div className="dashboard" style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gridTemplateRows: '64px 1fr',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}>
        {/* Top bar spans full width */}
        <div style={{ gridColumn: '1 / -1', gridRow: '1' }}>
          <MetricsTopBar />
        </div>

        {/* Left sidebar */}
        <div style={{
          gridColumn: '1',
          gridRow: '2',
          overflow: 'auto',
          borderRight: '1px solid var(--border-default)',
          background: 'var(--bg-primary)',
          padding: '16px',
        }}>
          <LayerSidebar />
        </div>

        {/* 3D Viewport */}
        <div style={{
          gridColumn: '2',
          gridRow: '2',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {mode === 'simulation' && <SimulationBanner />}
          <div style={{
            width: '100%',
            height: '100%',
            filter: mode === 'simulation' ? 'sepia(0.3) hue-rotate(180deg)' : undefined,
          }}>
            <DataCenterScene />
          </div>
          {/* Connection status badge */}
          <div style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-elevated)',
            padding: '4px 10px',
            borderRadius: 4,
            fontSize: 11,
            color: connectionStatus === 'connected' ? 'var(--healthy)' : connectionStatus === 'reconnecting' ? 'var(--warning)' : 'var(--critical)',
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'currentColor',
            }} />
            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          gridColumn: '3',
          gridRow: '2',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-default)',
          background: 'var(--bg-primary)',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <RightPanel />
          </div>
          {selectedLayer && (
            <div style={{
              height: 280,
              borderTop: '1px solid var(--border-default)',
              overflow: 'auto',
            }}>
              <ActionPanel />
            </div>
          )}
        </div>
      </div>

      <TradeoffModal />
      <ToastContainer />
    </>
  );
}
