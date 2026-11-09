import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import { useApp } from "./contexts/AppContext";
import { Login } from "./screens/auth/Login";
import { RegisterRep } from "./screens/auth/RegisterRep";
import { ForgotPassword } from "./screens/auth/ForgotPassword";
import { MainLayout } from "./screens/MainLayout";
import { Dashboard } from "./screens/connected/Dashboard";
import {
  Accounts,
  AddAccount,
  AccountDetails,
} from "./screens/connected/Accounts";
import {
  VisitCheckIn,
  CurrentVisit,
  VisitResult,
  AppointmentEditor,
  FollowUp,
  RejectVisit,
} from "./screens/connected/Visits";
import {
  CreateAgreement,
  AgreementDetails,
  ServiceList,
} from "./screens/connected/Agreements";
import {
  Calendar,
  Statistics,
  Reminders,
  Workday,
} from "./screens/connected/Reports";
import {
  Profile,
  SyncStatus,
  Settings,
  Help,
} from "./screens/connected/AccountSettings";

function Protected() {
  const { authReady, isAuthenticated } = useApp();
  const location = useLocation();
  if (!authReady)
    return (
      <div
        role="status"
        className="h-full flex items-center justify-center"
        dir="rtl"
      >
        جارٍ التحقق من الجلسة…
      </div>
    );
  if (!isAuthenticated)
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  return <Outlet />;
}
function RouteError() {
  return (
    <div
      dir="rtl"
      className="h-full overflow-y-auto p-8 space-y-4"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <h1 className="text-xl font-bold">تعذر عرض الصفحة</h1>
      <p>أعد تحميل الصفحة. إذا استمر الخطأ، تحقق من تشغيل الخادم.</p>
      <a href="/app/home-new" style={{ color: "var(--color-primary)" }}>
        العودة للرئيسية
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app/home-new" replace />,
    errorElement: <RouteError />,
  },
  {
    path: "/auth",
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <RegisterRep /> },
      { path: "forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    element: <Protected />,
    errorElement: <RouteError />,
    children: [
      { path: "/setup", element: <Navigate to="/app/home-new" replace /> },
      {
        path: "/app",
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/app/home-new" replace /> },
          { path: "home-new", element: <Dashboard /> },
          { path: "leads-new", element: <Accounts /> },
          { path: "map-new", element: <Accounts locations /> },
          { path: "calendar-new", element: <Calendar /> },
          { path: "stats-new", element: <Statistics /> },
          { path: "profile-new", element: <Profile /> },
          { path: "notifications-new", element: <Reminders /> },
          { path: "services-new", element: <ServiceList /> },
          ...[
            "home",
            "leads",
            "map",
            "calendar",
            "stats",
            "profile",
            "notifications",
            "services",
          ].map((path) => ({
            path,
            element: <Navigate to={`/app/${path}-new`} replace />,
          })),
          { path: "leads/:id", element: <AccountDetails /> },
          { path: "agreements/:agreementId", element: <AgreementDetails /> },
          {
            path: "appointments/:appointmentId/edit",
            element: <AppointmentEditor />,
          },
          { path: "timesheet", element: <Workday /> },
          { path: "sync-status", element: <SyncStatus /> },
          { path: "settings", element: <Settings /> },
          { path: "help", element: <Help /> },
        ],
      },
      {
        path: "/dropin",
        children: [
          { index: true, element: <Navigate to="/dropin/identify" replace /> },
          { path: "identify", element: <Accounts selectForVisit /> },
          { path: "identify-new", element: <Accounts selectForVisit /> },
          { path: "quick-add", element: <AddAccount /> },
          { path: "checkin/:accountId", element: <VisitCheckIn /> },
          { path: "checkin-new/:accountId", element: <VisitCheckIn /> },
          { path: "in-progress", element: <CurrentVisit /> },
          { path: "in-progress/:visitId", element: <CurrentVisit /> },
          { path: "outcome/:visitId", element: <VisitResult /> },
          { path: "services/:visitId", element: <CreateAgreement /> },
          { path: "cart/:visitId", element: <CreateAgreement /> },
          { path: "agreement/:visitId", element: <CreateAgreement /> },
          { path: "signature/:visitId", element: <CreateAgreement /> },
          { path: "appointment/:visitId", element: <AppointmentEditor /> },
          { path: "followup/:visitId", element: <FollowUp /> },
          { path: "reject/:visitId", element: <RejectVisit /> },
        ],
      },
      {
        path: "/visit",
        children: [
          { index: true, element: <Navigate to="/app/home-new" replace /> },
          { path: "active/:visitId", element: <CurrentVisit /> },
          { path: "outcome/:visitId", element: <VisitResult /> },
          { path: "next-step/:visitId", element: <VisitResult /> },
          { path: "deal/:visitId", element: <CreateAgreement /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/app/home-new" replace /> },
]);
