/**
 * Sync Status V2 - Redirect to OfflineDiagnostics
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function SyncStatusV2() {
  const navigate = useNavigate();

  useEffect(() => {
    // تحويل تلقائي لشاشة التشخيص الجديدة
    navigate('/diagnostics/offline', { replace: true });
  }, [navigate]);

  return null;
}
