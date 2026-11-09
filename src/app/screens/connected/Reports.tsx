import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../../contexts/AppContext";
import {
  Page,
  Card,
  Action,
  Field,
  Note,
  ErrorMessage,
  localDate,
  outcomeLabels,
} from "./ui";

export function Calendar() {
  const {
    appointments,
    accounts,
    updateAppointment,
    updateAccount,
    canAddData,
  } = useApp();
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const sorted = appointments
    .filter((a) => !date || a.date === date)
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const status = (id: string, next: "completed" | "cancelled") => {
    setError("");
    try {
      updateAppointment(id, { status: next });
      const appointment = appointments.find((item) => item.id === id);
      const account = accounts.find(
        (item) => item.id === appointment?.accountId,
      );
      if (account?.nextAction?.type === "appointment") {
        const upcoming = appointments
          .filter(
            (item) =>
              item.accountId === account.id &&
              item.id !== id &&
              item.status === "scheduled",
          )
          .sort((a, b) =>
            `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
          )[0];
        updateAccount(account.id, {
          nextAction: upcoming
            ? {
                type: "appointment",
                datetime: new Date(
                  `${upcoming.date}T${upcoming.time}`,
                ).toISOString(),
                notes: upcoming.reason,
              }
            : { type: "none" },
        });
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page title="المواعيد">
      <Field
        label="عرض مواعيد يوم محدد"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <div className="flex gap-3">
        <Action secondary onClick={() => setDate(localDate())}>
          اليوم
        </Action>
        <Action secondary onClick={() => setDate("")}>
          جميع المواعيد
        </Action>
      </div>
      <ErrorMessage error={error} />
      {!sorted.length && (
        <Card>
          <Note>
            لا توجد مواعيد في هذه الفترة. يمكنك حجز موعد عند تسجيل نتيجة زيارة.
          </Note>
        </Card>
      )}
      {sorted.map((a) => (
        <Card key={a.id}>
          <Link to={`/app/leads/${a.accountId}`} className="text-lg font-bold">
            {accounts.find((c) => c.id === a.accountId)?.name || "العميل"}
          </Link>
          <p>
            {a.date} · {a.time}
          </p>
          <p>{a.reason}</p>
          <Note>{a.notes}</Note>
          <p
            style={{
              color:
                a.status === "scheduled"
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
            }}
          >
            {a.status === "scheduled"
              ? "مجدول"
              : a.status === "completed"
                ? "مكتمل"
                : "ملغى"}
          </p>
          {a.status === "scheduled" && canAddData && (
            <div className="flex flex-wrap gap-3">
              <Link
                className="px-4 py-3 rounded-xl"
                style={{ background: "var(--bg-card-hover)" }}
                to={`/app/appointments/${a.id}/edit`}
              >
                تعديل الموعد
              </Link>
              <Action secondary onClick={() => status(a.id, "completed")}>
                تحديد كمكتمل
              </Action>
              <Action secondary onClick={() => status(a.id, "cancelled")}>
                إلغاء الموعد
              </Action>
            </div>
          )}
        </Card>
      ))}
    </Page>
  );
}

export function Statistics() {
  const { accounts, visits, agreements } = useApp();
  const completed = visits.filter((v) => v.endTime);
  const revenue = agreements
    .filter((a) => a.status !== "cancelled")
    .reduce((sum, a) => sum + a.total, 0);
  return (
    <Page title="الإحصائيات والاتفاقات">
      <Note>
        الأرقام محسوبة من بيانات حسابك المحفوظة، وتشمل العمليات المعلقة حتى تتم
        مزامنتها.
      </Note>
      <div className="grid grid-cols-2 gap-3">
        {[
          [accounts.length, "العملاء"],
          [completed.length, "زيارات مكتملة"],
          [agreements.length, "الاتفاقات"],
          [`${revenue.toLocaleString("ar")} ر.س`, "قيمة الاتفاقات"],
        ].map(([n, label]) => (
          <Card key={label}>
            <strong
              className="text-2xl"
              style={{ color: "var(--color-primary)" }}
            >
              {n}
            </strong>
            <p>{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-bold">نتائج الزيارات</h2>
        {Object.entries(outcomeLabels).map(([outcome, label]) => (
          <div key={outcome} className="flex justify-between">
            <span>{label}</span>
            <strong>
              {completed.filter((v) => v.outcome === outcome).length}
            </strong>
          </div>
        ))}
      </Card>
      <Card>
        <h2 className="font-bold">الاتفاقات المحفوظة</h2>
        {agreements.map((a) => (
          <Link
            className="block py-2"
            key={a.id}
            to={`/app/agreements/${a.id}`}
          >
            <p>
              {accounts.find((c) => c.id === a.accountId)?.name} —{" "}
              {a.total.toLocaleString("ar")} ر.س
            </p>
            <Note>{a.agreementNumber}</Note>
          </Link>
        ))}
        {!agreements.length && <Note>لم تُحفظ اتفاقات بعد.</Note>}
      </Card>
    </Page>
  );
}

export function Reminders() {
  const { accounts, appointments } = useApp();
  const upcoming = appointments
    .filter((a) => a.status === "scheduled")
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const followups = accounts
    .filter((a) => a.nextAction?.type === "followUp" && a.nextAction.datetime)
    .sort((a, b) =>
      a.nextAction!.datetime!.localeCompare(b.nextAction!.datetime!),
    );
  return (
    <Page title="المتابعات والمواعيد">
      <Note>
        تذكيرات من مواعيدك ومتابعاتك المحفوظة. إرسال إشعارات دفع آلية غير متاح
        حالياً.
      </Note>
      {followups.map((a) => (
        <Card key={a.id}>
          <Link to={`/app/leads/${a.id}`} className="font-bold">
            متابعة {a.name}
          </Link>
          <p>{new Date(a.nextAction!.datetime!).toLocaleString("ar")}</p>
          <Note>{a.nextAction?.notes}</Note>
        </Card>
      ))}
      {upcoming.map((a) => (
        <Card key={a.id}>
          <Link to={`/app/leads/${a.accountId}`} className="font-bold">
            موعد {accounts.find((c) => c.id === a.accountId)?.name}
          </Link>
          <p>
            {a.date} · {a.time}
          </p>
          <Note>{a.reason}</Note>
        </Card>
      ))}
      {!upcoming.length && !followups.length && (
        <Card>
          <Note>لا توجد مواعيد أو متابعات مسجلة.</Note>
        </Card>
      )}
    </Page>
  );
}

export function Workday() {
  const { workStatus, clockInTime, totalWorkTime, visits } = useApp();
  const today = localDate();
  return (
    <Page title="ملخص الدوام">
      <Card>
        <h2 className="font-bold">
          {workStatus === "clockedIn"
            ? "الدوام جارٍ"
            : workStatus === "break"
              ? "في استراحة"
              : "خارج الدوام"}
        </h2>
        {clockInTime && (
          <p>بداية الدوام: {new Date(clockInTime).toLocaleString("ar")}</p>
        )}
        <p>
          مدة العمل: {Math.floor(totalWorkTime / 3600)} ساعة و
          {Math.floor(totalWorkTime / 60) % 60} دقيقة
        </p>
        <Note>
          حالة الدوام محفوظة في هذا المتصفح. سجل الزيارات محفوظ في حسابك على
          الخادم.
        </Note>
      </Card>
      <Card>
        <h2 className="font-bold">زيارات اليوم</h2>
        {visits
          .filter((v) => localDate(new Date(v.startTime)) === today)
          .map((v) => (
            <Link
              key={v.id}
              to={`/app/leads/${v.accountId}`}
              className="block py-2"
            >
              {new Date(v.startTime).toLocaleTimeString("ar")} —{" "}
              {v.outcome ? outcomeLabels[v.outcome] : "جارية"}
            </Link>
          ))}
      </Card>
    </Page>
  );
}
