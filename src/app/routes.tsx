/**
 * App Routes - Fixed Version with Error Handling
 */

import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from './screens/auth/Login';
import { RegisterRep } from './screens/auth/RegisterRep';
import { ForgotPassword } from './screens/auth/ForgotPassword';
import { FirstRunSetup } from './screens/setup/FirstRunSetup';
import { MainLayout } from './screens/MainLayout';
import { HomeScreenNew } from './screens/HomeScreenNew';
import { MapScreen } from './screens/MapScreen';
import { CalendarScreenNew } from './screens/calendar/CalendarScreenNew';
import { LeadsScreenNew } from './screens/leads/LeadsScreenNew';
import { StatsScreenNew } from './screens/StatsScreenNew';
import { ProfileScreenNew } from './screens/profile/ProfileScreenNew';
import { NotificationsScreenNew } from './screens/notifications/NotificationsScreenNew';
import { ServicesScreen } from './screens/ServicesScreen';
import { IdentifyCustomerNew } from './screens/dropin/IdentifyCustomerNew';
import { QuickAddCustomer } from './screens/dropin/QuickAddCustomer';
import { CheckInNew } from './screens/dropin/CheckInNew';
import { InProgress } from './screens/dropin/InProgress';
import { OutcomeSheet } from './screens/dropin/OutcomeSheet';
import { ServicesCatalog } from './screens/services/ServicesCatalog';
import { Cart } from './screens/services/Cart';
import { AgreementTerms } from './screens/agreement/AgreementTerms';
import { Signature } from './screens/agreement/Signature';
import { ScheduleAppointment } from './screens/outcomes/ScheduleAppointment';
import { BusyFollowUp } from './screens/outcomes/BusyFollowUp';
import { Rejection } from './screens/outcomes/Rejection';
import { Timesheet } from './screens/drawer/Timesheet';
import { Settings } from './screens/drawer/Settings';
import { Help } from './screens/drawer/Help';
import { SyncStatus } from './screens/drawer/SyncStatus';
import { LeadDetails } from './screens/leads/LeadDetails';

// Error Boundary Component
function ErrorBoundary() {
  return (
    <div className="mobile-screen" dir="rtl">
      <div className="mobile-content flex items-center justify-center px-6">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--bg-card)' }}
          >
            <span style={{ fontSize: '32px' }}>⚠️</span>
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            حدث خطأ
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            عذراً، حدث خطأ غير متوقع
          </p>
          <button
            onClick={() => window.location.href = '/app/home-new'}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{
              background: 'var(--color-primary)',
              color: '#000',
            }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/auth',
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <RegisterRep /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    path: '/setup',
    element: <FirstRunSetup />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/app',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/app/home-new" replace /> },
      
      /* New Screens - Mobile Optimized */
      { path: 'home-new', element: <HomeScreenNew /> },
      { path: 'map-new', element: <MapScreen /> },
      { path: 'calendar-new', element: <CalendarScreenNew /> },
      { path: 'leads-new', element: <LeadsScreenNew /> },
      { path: 'stats-new', element: <StatsScreenNew /> },
      { path: 'profile-new', element: <ProfileScreenNew /> },
      { path: 'notifications-new', element: <NotificationsScreenNew /> },
      { path: 'services-new', element: <ServicesScreen /> },
      
      /* Redirects for old routes */
      { path: 'home', element: <Navigate to="/app/home-new" replace /> },
      { path: 'map', element: <Navigate to="/app/map-new" replace /> },
      { path: 'calendar', element: <Navigate to="/app/calendar-new" replace /> },
      { path: 'leads', element: <Navigate to="/app/leads-new" replace /> },
      { path: 'stats', element: <Navigate to="/app/stats-new" replace /> },
      { path: 'profile', element: <Navigate to="/app/profile-new" replace /> },
      { path: 'notifications', element: <Navigate to="/app/notifications-new" replace /> },
      
      /* Other Screens */
      { path: 'leads/:id', element: <LeadDetails /> },
      { path: 'timesheet', element: <Timesheet /> },
      { path: 'settings', element: <Settings /> },
      { path: 'help', element: <Help /> },
      { path: 'sync-status', element: <SyncStatus /> },
    ],
  },
  {
    path: '/visit',
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'active/:visitId', element: <InProgress /> },
    ],
  },
  {
    path: '/dropin',
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'identify-new', element: <IdentifyCustomerNew /> },
      { path: 'quick-add', element: <QuickAddCustomer /> },
      { path: 'checkin-new/:accountId', element: <CheckInNew /> },
      { path: 'outcome/:visitId', element: <OutcomeSheet /> },
      { path: 'appointment/:visitId', element: <ScheduleAppointment /> },
      { path: 'followup/:visitId', element: <BusyFollowUp /> },
      { path: 'reject/:visitId', element: <Rejection /> },
      { path: 'services/:visitId', element: <ServicesCatalog /> },
      { path: 'cart/:visitId', element: <Cart /> },
      { path: 'agreement/:visitId', element: <AgreementTerms /> },
      { path: 'signature/:visitId', element: <Signature /> },
      { path: 'in-progress', element: <InProgress /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app/home-new" replace />,
  },
]);
