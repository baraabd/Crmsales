import { Outlet } from 'react-router';
import { useApp } from './contexts/AppContext';
import { SyncProvider } from './contexts/SyncContext';
import { DailySummaryModal } from './components/DailySummaryModal';
import { BreakNotification } from './components/BreakNotification';
import { useState, useEffect } from 'react';

export function RootLayout() {
  const { workStatus, dailySummary, breakTimeRemaining, setWorkStatus } = useApp();
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (workStatus === 'offDuty' && dailySummary) {
      setShowSummary(true);
    }
  }, [workStatus, dailySummary]);

  return (
    <SyncProvider>
      <Outlet />
      
      {/* Break Notification */}
      {workStatus === 'break' && (
        <BreakNotification
          breakTimeRemaining={breakTimeRemaining}
          onEndBreak={() => setWorkStatus('clockedIn')}
        />
      )}
      
      {/* Daily Summary Modal */}
      <DailySummaryModal
        isOpen={showSummary}
        summary={dailySummary}
        onClose={() => setShowSummary(false)}
      />
    </SyncProvider>
  );
}