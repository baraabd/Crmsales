import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useApp } from "../../contexts/AppContext";
import {
  Page,
  Card,
  Action,
  Field,
  Note,
  ErrorMessage,
  lifecycleLabels,
  outcomeLabels,
  fieldStyle,
} from "./ui";

export function Accounts({
  selectForVisit = false,
  locations = false,
}: {
  selectForVisit?: boolean;
  locations?: boolean;
}) {
  const { accounts, canAddData } = useApp();
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState("all");
  const filtered = accounts.filter(
    (a) =>
      (lifecycle === "all" || a.lifecycle === lifecycle) &&
      `${a.name} ${a.phone || ""} ${a.contactPerson || ""} ${a.address || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <Page
      title={
        selectForVisit
          ? "اختيار عميل للزيارة"
          : locations
            ? "مواقع العملاء"
            : "العملاء"
      }
      back={selectForVisit ? "/app/home-new" : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <Note>{accounts.length} عميل محفوظ في حسابك</Note>
        <Link
          className="font-semibold"
          style={{ color: "var(--color-primary)" }}
          to="/dropin/quick-add"
        >
          + إضافة عميل
        </Link>
      </div>
      {selectForVisit && !canAddData && (
        <Card>
          <Note>ابدأ الدوام من الرئيسية لتسجيل زيارة.</Note>
          <Link to="/app/home-new">الانتقال للرئيسية</Link>
        </Card>
      )}
      {locations && (
        <Note>
          افتح موقع العميل المحفوظ على الخريطة، أو اختر العميل لبدء زيارة.
        </Note>
      )}
      <Field
        label="بحث في العملاء"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="الاسم أو الهاتف أو العنوان"
      />
      <label className="block space-y-2">
        <span>حالة العميل</span>
        <select
          value={lifecycle}
          onChange={(e) => setLifecycle(e.target.value)}
          style={fieldStyle}
        >
          <option value="all">كل الحالات</option>
          {Object.entries(lifecycleLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {!filtered.length && (
        <Card>
          <Note>
            {accounts.length
              ? "لا توجد نتائج مطابقة."
              : "لم تضف أي عميل بعد. أضف أول عميل للبدء."}
          </Note>
        </Card>
      )}
      {filtered.map((a) => (
        <Card key={a.id}>
          <Link
            className="font-bold text-lg block"
            to={
              selectForVisit && canAddData
                ? `/dropin/checkin/${a.id}`
                : `/app/leads/${a.id}`
            }
          >
            {a.name}
          </Link>
          <Note>
            {lifecycleLabels[a.lifecycle]}
            {a.contactPerson ? ` · ${a.contactPerson}` : ""}
          </Note>
          <Note>{a.address}</Note>
          <div
            className="flex flex-wrap gap-4 text-sm"
            style={{ color: "var(--color-primary)" }}
          >
            {a.phone && <a href={`tel:${a.phone}`}>اتصال</a>}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${a.latitude},${a.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              فتح الموقع على الخريطة
            </a>
          </div>
        </Card>
      ))}
    </Page>
  );
}

export function AddAccount() {
  const { addAccount, canAddData } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const locate = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع. أدخل الإحداثيات الصحيحة يدوياً.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm((f) => ({
          ...f,
          latitude: String(p.coords.latitude),
          longitude: String(p.coords.longitude),
        }));
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError(
          "تعذر تحديد الموقع. اسمح بالوصول إلى الموقع أو أدخل الإحداثيات الصحيحة يدوياً.",
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2) {
      setError("اكتب اسم عميل من حرفين على الأقل.");
      return;
    }
    const latitude = Number(form.latitude),
      longitude = Number(form.longitude);
    if (
      !form.latitude.trim() ||
      !form.longitude.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      setError("أدخل خط عرض بين ‎-90 و90 وخط طول بين ‎-180 و180.");
      return;
    }
    try {
      const a = addAccount({
        ...form,
        name: form.name.trim(),
        latitude,
        longitude,
        lifecycle: "prospect",
        pinColor: "blue",
      });
      navigate(`/app/leads/${a.id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Page title="إضافة عميل" back="/app/leads-new">
      <Note>تُحفظ بيانات العميل في حسابك وتُرسل إلى الخادم عند الاتصال.</Note>
      {!canAddData && (
        <Card>
          <Note>ابدأ الدوام قبل إضافة عميل.</Note>
          <Link to="/app/home-new">العودة للرئيسية</Link>
        </Card>
      )}
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="اسم العميل"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          minLength={2}
          maxLength={200}
          required
        />
        <Field
          label="اسم مسؤول التواصل"
          maxLength={200}
          value={form.contactPerson}
          onChange={(e) => set("contactPerson", e.target.value)}
        />
        <Field
          label="رقم الهاتف"
          maxLength={80}
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <Field
          label="العنوان"
          maxLength={1000}
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
        <Card>
          <h2 className="font-bold">موقع العميل</h2>
          <Note>
            استخدم موقعك الحالي إذا كنت لدى العميل، أو أدخل إحداثيات موقعه.
          </Note>
          <Action secondary onClick={locate} disabled={locating}>
            {locating ? "جارٍ تحديد الموقع…" : "استخدام موقعي الحالي"}
          </Action>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="خط العرض"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              required
            />
            <Field
              label="خط الطول"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              required
            />
          </div>
        </Card>
        <ErrorMessage error={error} />
        <Action type="submit" disabled={!canAddData}>
          حفظ العميل
        </Action>
      </form>
    </Page>
  );
}

export function AccountDetails() {
  const { id } = useParams();
  const {
    accounts,
    visits,
    appointments,
    agreements,
    canAddData,
    currentVisit,
  } = useApp();
  const account = accounts.find((a) => a.id === id);
  if (!account)
    return (
      <Page title="العميل غير موجود" back="/app/leads-new">
        <Note>قد يكون الرابط قديماً أو الحساب مختلفاً.</Note>
      </Page>
    );
  const history = visits
    .filter((v) => v.accountId === id)
    .sort((a, b) => b.startTime.localeCompare(a.startTime));
  return (
    <Page title={account.name} back="/app/leads-new">
      <Card>
        <p>{lifecycleLabels[account.lifecycle]}</p>
        <Note>{account.contactPerson}</Note>
        <Note>{account.phone}</Note>
        <Note>{account.address}</Note>
        <div
          className="flex flex-wrap gap-4"
          style={{ color: "var(--color-primary)" }}
        >
          {account.phone && <a href={`tel:${account.phone}`}>اتصال</a>}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${account.latitude},${account.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            فتح الخريطة
          </a>
        </div>
      </Card>
      {canAddData ? (
        <Link
          className="inline-block px-5 py-3 rounded-xl font-bold"
          style={{ background: "var(--color-primary)", color: "#07150d" }}
          to={
            currentVisit
              ? `/dropin/in-progress/${currentVisit.id}`
              : `/dropin/checkin/${id}`
          }
        >
          {currentVisit ? "متابعة الزيارة الجارية" : "بدء زيارة لهذا العميل"}
        </Link>
      ) : (
        <Note>ابدأ الدوام من الرئيسية لتسجيل زيارة.</Note>
      )}
      {account.nextAction?.datetime && (
        <Card>
          <h2 className="font-bold">المتابعة القادمة</h2>
          <p>{new Date(account.nextAction.datetime).toLocaleString("ar")}</p>
          <Note>{account.nextAction.notes}</Note>
        </Card>
      )}
      <Card>
        <h2 className="font-bold">المواعيد</h2>
        {appointments
          .filter((a) => a.accountId === id)
          .map((a) => (
            <div key={a.id} className="py-2">
              <p>
                {a.date} · {a.time} — {a.reason}
              </p>
              <Note>
                {a.status === "scheduled"
                  ? "مجدول"
                  : a.status === "completed"
                    ? "مكتمل"
                    : "ملغى"}
              </Note>
            </div>
          ))}
        {!appointments.some((a) => a.accountId === id) && (
          <Note>لا توجد مواعيد.</Note>
        )}
      </Card>
      <Card>
        <h2 className="font-bold">سجل الزيارات</h2>
        {history.map((v) => (
          <div key={v.id} className="py-2">
            <p>
              {new Date(v.startTime).toLocaleString("ar")} —{" "}
              {v.outcome ? outcomeLabels[v.outcome] : "جارية"}
            </p>
            <Note>{v.notes}</Note>
          </div>
        ))}
        {!history.length && <Note>لا توجد زيارات مسجلة.</Note>}
      </Card>
      <Card>
        <h2 className="font-bold">الاتفاقات</h2>
        {agreements
          .filter((a) => a.accountId === id)
          .map((a) => (
            <Link
              className="block py-2"
              key={a.id}
              to={`/app/agreements/${a.id}`}
            >
              {a.agreementNumber} — {a.total.toLocaleString("ar")} ر.س
            </Link>
          ))}
        {!agreements.some((a) => a.accountId === id) && (
          <Note>لا توجد اتفاقات.</Note>
        )}
      </Card>
    </Page>
  );
}
