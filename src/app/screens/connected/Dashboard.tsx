import { Link } from "react-router";
import { useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { Page, Card, Action, Note, ErrorMessage, localDate } from "./ui";

export function Dashboard() {
  const {
    user,
    accounts,
    visits,
    appointments,
    workStatus,
    setWorkStatus,
    totalWorkTime,
    currentVisit,
    outbox,
    syncNow,
  } = useApp();
  const [error, setError] = useState("");
  const today = localDate();
  const completed = visits.filter(
    (v) => v.endTime && localDate(new Date(v.endTime)) === today,
  );
  const scheduled = appointments.filter(
    (a) => a.date === today && a.status === "scheduled",
  );
  const statusLabel = {
    offDuty: "لم يبدأ الدوام",
    clockedIn: "الدوام جارٍ",
    break: "في استراحة",
  }[workStatus];
  const runSync = async () => {
    setError("");
    try {
      await syncNow();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page title={`مرحباً ${user?.name || ""}`}>
      <Note>
        {new Date().toLocaleDateString("ar", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </Note>
      <Card>
        <h2 className="font-bold text-lg">{statusLabel}</h2>
        <Note>
          مدة العمل المسجلة: {Math.floor(totalWorkTime / 3600)} ساعة و
          {Math.floor(totalWorkTime / 60) % 60} دقيقة
        </Note>
        <div className="flex flex-wrap gap-3">
          {workStatus === "offDuty" ? (
            <Action onClick={() => setWorkStatus("clockedIn")}>
              بدء الدوام
            </Action>
          ) : (
            <>
              <Action
                onClick={() =>
                  setWorkStatus(workStatus === "break" ? "clockedIn" : "break")
                }
              >
                {workStatus === "break" ? "إنهاء الاستراحة" : "بدء استراحة"}
              </Action>
              <Action
                secondary
                disabled={!!currentVisit}
                onClick={() => setWorkStatus("offDuty")}
              >
                إنهاء الدوام
              </Action>
            </>
          )}
        </div>
        {currentVisit && <Note>أكمل الزيارة الجارية قبل إنهاء الدوام.</Note>}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {[
          [accounts.length, "العملاء"],
          [completed.length, "زيارات اليوم"],
          [
            completed.filter((v) => v.outcome === "deal").length,
            "اتفاقات اليوم",
          ],
          [scheduled.length, "مواعيد اليوم"],
        ].map(([value, label]) => (
          <Card key={label}>
            <strong
              className="text-3xl"
              style={{ color: "var(--color-primary)" }}
            >
              {value}
            </strong>
            <p>{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-bold">الإجراءات</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            className="px-4 py-3 rounded-xl font-semibold"
            style={{ background: "var(--color-primary)", color: "#07150d" }}
            to={
              currentVisit
                ? `/dropin/in-progress/${currentVisit.id}`
                : "/dropin/identify"
            }
          >
            {currentVisit ? "متابعة الزيارة الجارية" : "بدء زيارة"}
          </Link>
          <Link
            className="px-4 py-3 rounded-xl"
            style={{ background: "var(--bg-card-hover)" }}
            to="/dropin/quick-add"
          >
            إضافة عميل
          </Link>
          <Link
            className="px-4 py-3 rounded-xl"
            style={{ background: "var(--bg-card-hover)" }}
            to="/app/stats-new"
          >
            الإحصائيات والاتفاقات
          </Link>
        </div>
      </Card>
      <Card>
        <h2 className="font-bold">المزامنة</h2>
        <Note>
          {outbox.length
            ? `${outbox.length} عملية تنتظر الحفظ في الخادم`
            : "لا توجد عمليات معلقة"}
        </Note>
        <Action secondary onClick={runSync}>
          مزامنة الآن
        </Action>
        <ErrorMessage error={error} />
      </Card>
      {scheduled.length > 0 && (
        <Card>
          <h2 className="font-bold">مواعيد اليوم</h2>
          {scheduled.map((a) => (
            <Link
              key={a.id}
              className="block py-2"
              to={`/app/leads/${a.accountId}`}
            >
              {a.time} — {accounts.find((c) => c.id === a.accountId)?.name} —{" "}
              {a.reason}
            </Link>
          ))}
        </Card>
      )}
    </Page>
  );
}
