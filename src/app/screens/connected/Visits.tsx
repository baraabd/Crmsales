import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useApp } from "../../contexts/AppContext";
import {
  Page,
  Card,
  Action,
  Field,
  Note,
  ErrorMessage,
  fieldStyle,
  localDate,
} from "./ui";

function visitNotes(userId: string | undefined, visitId: string | undefined) {
  if (!userId || !visitId) return "";
  return localStorage.getItem(`crm:visit-notes:${userId}:${visitId}`) || "";
}
export function VisitCheckIn() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { accounts, canAddData, currentVisit, startVisit } = useApp();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const account = accounts.find((a) => a.id === accountId);
  const locate = () => {
    setError("");
    if (!navigator.geolocation) {
      setError(
        "المتصفح لا يدعم تحديد الموقع. أدخل موقع الزيارة الحقيقي يدوياً.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLatitude(String(p.coords.latitude));
        setLongitude(String(p.coords.longitude));
        setAccuracy(p.coords.accuracy);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError(
          "تعذر الحصول على GPS. اسمح باستخدام الموقع أو أدخل إحداثيات موقعك الحقيقي.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };
  if (currentVisit)
    return <Navigate to={`/dropin/in-progress/${currentVisit.id}`} replace />;
  if (!account)
    return (
      <Page title="العميل غير موجود" back="/app/leads-new">
        <Note>اختر عميلاً محفوظاً لبدء الزيارة.</Note>
      </Page>
    );
  const start = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!latitude.trim() || !longitude.trim()) {
      setError("حدد موقع الزيارة أولاً.");
      return;
    }
    try {
      const visit = startVisit(account.id, Number(latitude), Number(longitude));
      navigate(`/dropin/in-progress/${visit.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page title="بدء زيارة" back={`/app/leads/${account.id}`}>
      <Card>
        <h2 className="font-bold text-lg">{account.name}</h2>
        <Note>{account.address}</Note>
        <Note>
          سجّل موقعك عند بدء الزيارة. لا يُستخدم موقع افتراضي عند فشل GPS.
        </Note>
      </Card>
      <form className="space-y-4" onSubmit={start}>
        <Action secondary disabled={locating} onClick={locate}>
          {locating ? "جارٍ تحديد الموقع…" : "تحديد موقع الزيارة GPS"}
        </Action>
        {accuracy !== null && (
          <Note>الدقة التقريبية: {Math.round(accuracy)} متر.</Note>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="خط عرض الزيارة"
            type="number"
            min={-90}
            max={90}
            step="any"
            required
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              setAccuracy(null);
            }}
          />
          <Field
            label="خط طول الزيارة"
            type="number"
            min={-180}
            max={180}
            step="any"
            required
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              setAccuracy(null);
            }}
          />
        </div>
        <Note>الإدخال اليدوي متاح إذا تعذر تحديد موقعك آلياً.</Note>
        {!canAddData && <Note>ابدأ الدوام من الرئيسية أولاً.</Note>}
        <ErrorMessage error={error} />
        <Action type="submit" disabled={!canAddData || locating}>
          تسجيل بدء الزيارة
        </Action>
      </form>
    </Page>
  );
}

export function CurrentVisit() {
  const { visitId } = useParams();
  const { currentVisit, accounts, user } = useApp();
  const [now, setNow] = useState(Date.now());
  const [notes, setNotes] = useState(() =>
    visitNotes(user?.id, currentVisit?.id),
  );
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (user && currentVisit)
      localStorage.setItem(
        `crm:visit-notes:${user.id}:${currentVisit.id}`,
        notes,
      );
  }, [notes, currentVisit, user]);
  if (!currentVisit || (visitId && currentVisit.id !== visitId))
    return <Navigate to="/app/home-new" replace />;
  const account = accounts.find((a) => a.id === currentVisit.accountId);
  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(currentVisit.startTime).getTime()) / 1000),
  );
  return (
    <Page title="الزيارة جارية" back="/app/home-new">
      <Card>
        <h2 className="text-xl font-bold">{account?.name}</h2>
        <Note>{account?.address}</Note>
        <div
          className="text-5xl font-mono text-center py-4"
          style={{ color: "var(--color-primary)" }}
          aria-label="مدة الزيارة"
        >
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </div>
        <Note>
          بدأت في {new Date(currentVisit.startTime).toLocaleTimeString("ar")}
        </Note>
        {account?.phone && (
          <a
            style={{ color: "var(--color-primary)" }}
            href={`tel:${account.phone}`}
          >
            اتصال بالعميل
          </a>
        )}
      </Card>
      <label className="block space-y-2">
        <span>ملاحظات الزيارة</span>
        <textarea
          style={fieldStyle}
          rows={5}
          maxLength={4000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      <Note>تحفظ الملاحظات مؤقتاً وتُضاف إلى نتيجة الزيارة عند إكمالها.</Note>
      <Link
        className="block text-center px-5 py-3 rounded-xl font-bold"
        style={{ background: "var(--color-primary)", color: "#07150d" }}
        to={`/dropin/outcome/${currentVisit.id}`}
      >
        إنهاء الزيارة وتحديد النتيجة
      </Link>
    </Page>
  );
}

export function VisitResult() {
  const { visitId } = useParams();
  const { currentVisit } = useApp();
  if (!currentVisit || currentVisit.id !== visitId)
    return <Navigate to="/app/home-new" replace />;
  return (
    <Page title="نتيجة الزيارة" back={`/dropin/in-progress/${visitId}`}>
      <Note>اختر النتيجة لإكمال الزيارة وتحديث سجل العميل.</Note>
      {[
        [
          "services",
          "اتفاق على خدمات",
          "اختيار الخدمات والشروط وتوقيع الاتفاق",
        ],
        ["appointment", "حجز موعد", "تحديد موعد زيارة لاحقة"],
        ["followup", "مشغول / متابعة لاحقاً", "حفظ تاريخ المتابعة والملاحظات"],
        ["reject", "غير مهتم", "تسجيل سبب الرفض"],
      ].map(([path, title, note]) => (
        <Link key={path} className="block" to={`/dropin/${path}/${visitId}`}>
          <Card>
            <h2
              className="text-lg font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              {title}
            </h2>
            <Note>{note}</Note>
          </Card>
        </Link>
      ))}
    </Page>
  );
}

export function AppointmentEditor() {
  const { visitId, appointmentId } = useParams();
  const {
    currentVisit,
    appointments,
    addAppointment,
    updateAppointment,
    updateAccount,
    endVisit,
    user,
    canAddData,
  } = useApp();
  const existing = appointments.find((a) => a.id === appointmentId);
  const navigate = useNavigate();
  const [date, setDate] = useState(existing?.date || localDate());
  const [time, setTime] = useState(existing?.time || "");
  const [reason, setReason] = useState(existing?.reason || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [error, setError] = useState("");
  const accountId = existing?.accountId || currentVisit?.accountId;
  if (
    (!existing && (!currentVisit || currentVisit.id !== visitId)) ||
    !accountId
  )
    return <Navigate to="/app/calendar-new" replace />;
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!reason.trim()) {
      setError("اكتب سبب الموعد.");
      return;
    }
    const datetime = new Date(`${date}T${time}`);
    if (
      !Number.isFinite(datetime.getTime()) ||
      datetime.getTime() <= Date.now()
    ) {
      setError("اختر موعداً في المستقبل.");
      return;
    }
    if (
      appointments.some(
        (a) =>
          a.id !== existing?.id &&
          a.status === "scheduled" &&
          a.date === date &&
          a.time === time,
      )
    ) {
      setError("يوجد موعد آخر في الوقت نفسه. اختر وقتاً مختلفاً.");
      return;
    }
    try {
      if (existing)
        updateAppointment(existing.id, {
          date,
          time,
          reason: reason.trim(),
          notes,
        });
      else
        addAppointment({
          accountId,
          visitId: currentVisit!.id,
          date,
          time,
          reason: reason.trim(),
          notes,
          status: "scheduled",
        });
      updateAccount(accountId, {
        lifecycle: "warm",
        pinColor: "yellow",
        nextAction: {
          type: "appointment",
          datetime: datetime.toISOString(),
          notes: reason,
        },
      });
      if (!existing)
        endVisit(
          currentVisit!.id,
          "appointment",
          [visitNotes(user?.id, currentVisit!.id), reason, notes]
            .filter(Boolean)
            .join("\n"),
        );
      navigate("/app/calendar-new");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page
      title={existing ? "تعديل الموعد" : "حجز موعد"}
      back={existing ? "/app/calendar-new" : `/dropin/outcome/${visitId}`}
    >
      <form onSubmit={save} className="space-y-4">
        <Field
          label="تاريخ الموعد"
          type="date"
          value={date}
          min={localDate()}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Field
          label="وقت الموعد"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <Field
          label="سبب الموعد"
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <label className="block space-y-2">
          <span>ملاحظات الموعد</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={fieldStyle}
            rows={3}
            maxLength={4000}
          />
        </label>
        <Note>
          يُحفظ الموعد في تقويم حسابك. لا تُرسل رسائل بريد أو SMS تلقائية.
        </Note>
        {!canAddData && <Note>ابدأ الدوام لإضافة موعد أو تعديله.</Note>}
        <ErrorMessage error={error} />
        <Action type="submit" disabled={!canAddData}>
          حفظ الموعد
        </Action>
      </form>
    </Page>
  );
}

export function FollowUp() {
  const { visitId } = useParams();
  const { currentVisit, updateAccount, endVisit, user } = useApp();
  const navigate = useNavigate();
  const [datetime, setDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  if (!currentVisit || currentVisit.id !== visitId)
    return <Navigate to="/app/home-new" replace />;
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const date = new Date(datetime);
    if (!notes.trim()) {
      setError("اكتب ملاحظات المتابعة.");
      return;
    }
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) {
      setError("اختر وقت متابعة في المستقبل.");
      return;
    }
    try {
      updateAccount(currentVisit.accountId, {
        lifecycle: "warm",
        pinColor: "yellow",
        nextAction: { type: "followUp", datetime: date.toISOString(), notes },
      });
      endVisit(
        currentVisit.id,
        "busy",
        [visitNotes(user?.id, currentVisit.id), notes]
          .filter(Boolean)
          .join("\n"),
      );
      navigate("/app/home-new");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page title="تحديد المتابعة" back={`/dropin/outcome/${visitId}`}>
      <form onSubmit={save} className="space-y-4">
        <Field
          label="تاريخ ووقت المتابعة"
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          required
        />
        <label className="block space-y-2">
          <span>ملاحظات المتابعة</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={fieldStyle}
            rows={4}
            maxLength={4000}
            required
          />
        </label>
        <ErrorMessage error={error} />
        <Action type="submit">حفظ المتابعة وإنهاء الزيارة</Action>
      </form>
    </Page>
  );
}

export function RejectVisit() {
  const { visitId } = useParams();
  const { currentVisit, updateAccount, endVisit, user } = useApp();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [completedAccountId, setCompletedAccountId] = useState<string | null>(
    null,
  );
  if (completedAccountId)
    return <Navigate to={`/app/leads/${completedAccountId}`} replace />;
  if (!currentVisit || currentVisit.id !== visitId)
    return <Navigate to="/app/home-new" replace />;
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!reason || (reason === "سبب آخر" && !notes.trim())) {
      setError("حدد السبب واكتب التفاصيل إذا اخترت سبباً آخر.");
      return;
    }
    try {
      updateAccount(currentVisit.accountId, {
        lifecycle: "lost",
        pinColor: "gray",
        nextAction: { type: "none" },
      });
      setCompletedAccountId(currentVisit.accountId);
      endVisit(
        currentVisit.id,
        "rejected",
        [visitNotes(user?.id, currentVisit.id), reason, notes]
          .filter(Boolean)
          .join("\n"),
      );
    } catch (e) {
      setCompletedAccountId(null);
      setError((e as Error).message);
    }
  };
  return (
    <Page title="تسجيل سبب الرفض" back={`/dropin/outcome/${visitId}`}>
      <form onSubmit={save} className="space-y-4">
        <label className="block space-y-2">
          <span>سبب الرفض</span>
          <select
            aria-label="سبب الرفض"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            style={fieldStyle}
          >
            <option value="">اختر السبب</option>
            {[
              "السعر مرتفع",
              "لا توجد حاجة حالياً",
              "متعاقد مع جهة أخرى",
              "صاحب القرار غير متاح",
              "سبب آخر",
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span>تفاصيل الرفض</span>
          <textarea
            rows={4}
            maxLength={4000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={fieldStyle}
            required={reason === "سبب آخر"}
          />
        </label>
        <ErrorMessage error={error} />
        <Action type="submit">حفظ النتيجة وإنهاء الزيارة</Action>
      </form>
    </Page>
  );
}
