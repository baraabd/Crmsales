import { Link, NavLink, Outlet } from "react-router";
import { Home, Calendar, MapPin, Users, User, Bell, Menu } from "lucide-react";
import { useApp } from "../contexts/AppContext";

export function MainLayout() {
  const { user, outbox, appointments, accounts, authError } = useApp();
  const reminderCount =
    appointments.filter((a) => a.status === "scheduled").length +
    accounts.filter((a) => a.nextAction?.type === "followUp").length;
  const tabs = [
    { path: "/app/home-new", label: "الرئيسية", Icon: Home },
    { path: "/app/calendar-new", label: "المواعيد", Icon: Calendar },
    { path: "/app/map-new", label: "المواقع", Icon: MapPin },
    { path: "/app/leads-new", label: "العملاء", Icon: Users },
    { path: "/app/profile-new", label: "الحساب", Icon: User },
  ];
  return (
    <div
      className="h-full flex flex-col max-w-5xl mx-auto"
      dir="rtl"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <header
        className="flex-none px-4 py-3 flex items-center justify-between relative z-30"
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <details className="relative">
          <summary
            className="cursor-pointer list-none p-2"
            aria-label="القائمة"
          >
            <Menu size={24} />
          </summary>
          <nav
            aria-label="القائمة الجانبية"
            className="absolute right-0 top-full mt-3 p-3 rounded-2xl shadow-xl w-60 space-y-1"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <p className="px-3 py-2 font-bold">{user?.name}</p>
            {[
              ["/app/timesheet", "ملخص الدوام"],
              ["/app/stats-new", "الإحصائيات والاتفاقات"],
              ["/app/services-new", "الخدمات والباقات"],
              ["/app/sync-status", `المزامنة (${outbox.length})`],
              ["/app/settings", "الإعدادات"],
              ["/app/help", "المساعدة"],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="block p-3 rounded-xl"
                onClick={(event) =>
                  event.currentTarget
                    .closest("details")
                    ?.removeAttribute("open")
                }
              >
                {label}
              </Link>
            ))}
          </nav>
        </details>
        <Link
          to="/app/home-new"
          className="font-bold tracking-widest"
          style={{ color: "var(--color-primary)" }}
        >
          CRM SALES
        </Link>
        <Link
          to="/app/notifications-new"
          className="relative p-2"
          aria-label={`المتابعات والمواعيد (${reminderCount})`}
        >
          <Bell size={22} />
          {reminderCount > 0 && (
            <span
              className="absolute -top-1 -left-1 px-1 rounded-full text-xs"
              style={{ background: "var(--color-primary)", color: "#07150d" }}
            >
              {reminderCount}
            </span>
          )}
        </Link>
      </header>
      {authError && (
        <div
          role="alert"
          className="flex-none px-4 py-2 text-sm"
          style={{ background: "#ff3b4718", color: "var(--color-red)" }}
        >
          {authError}{" "}
          <Link to="/app/sync-status" className="underline">
            إعادة المزامنة
          </Link>
        </div>
      )}
      {outbox.length > 0 && (
        <div
          role="status"
          className="flex-none block px-4 py-2 text-center text-sm"
          style={{ background: "#ff950018", color: "var(--color-orange)" }}
        >
          <Link to="/app/sync-status">
            {outbox.some((item) => item.status === "failed")
              ? `تعذر إرسال بعض البيانات — ${outbox.length} عملية لم تُحفظ في الخادم. عرض التفاصيل`
              : `${outbox.length} عملية تنتظر الحفظ في الخادم — عرض المزامنة`}
          </Link>
        </div>
      )}
      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>
      <nav
        aria-label="التنقل الرئيسي"
        className="flex-none flex items-center justify-around px-2 pt-3 pb-4"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-color)",
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        }}
      >
        {tabs.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className="flex flex-col items-center gap-1 px-2 py-1 text-xs"
            style={({ isActive }) => ({
              color: isActive
                ? "var(--color-primary)"
                : "var(--text-secondary)",
            })}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
