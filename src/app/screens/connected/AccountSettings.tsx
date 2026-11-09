import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useApp } from "../../contexts/AppContext";
import { Page, Card, Action, Field, Note, ErrorMessage } from "./ui";

export function Profile() {
  const { user, updateProfile, logout } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSaved(false);
    setError("");
    try {
      await updateProfile({ name, company });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Page title="حسابي">
      <Card>
        <p className="font-bold text-xl">{user?.name}</p>
        <Note>{user?.email}</Note>
        {user?.employeeId && <Note>الرقم الوظيفي: {user.employeeId}</Note>}
      </Card>
      <form onSubmit={save} className="space-y-4">
        <Field
          label="الاسم الكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
        <Field
          label="الشركة"
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <ErrorMessage error={error} />
        {saved && (
          <p role="status" style={{ color: "var(--color-primary)" }}>
            تم حفظ بيانات الحساب
          </p>
        )}
        <Action type="submit" disabled={loading}>
          {loading ? "جارٍ الحفظ…" : "حفظ بيانات الحساب"}
        </Action>
      </form>
      <Card>
        <Link className="block py-2" to="/app/stats-new">
          الإحصائيات والاتفاقات
        </Link>
        <Link className="block py-2" to="/app/services-new">
          الخدمات والباقات
        </Link>
        <Link className="block py-2" to="/app/sync-status">
          حالة المزامنة
        </Link>
        <Link className="block py-2" to="/app/settings">
          الإعدادات
        </Link>
      </Card>
      <Action
        secondary
        onClick={() => {
          logout();
          navigate("/auth/login", { replace: true });
        }}
      >
        تسجيل الخروج
      </Action>
    </Page>
  );
}

export function SyncStatus() {
  const { outbox, syncNow, isOnline } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sync = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await syncNow();
      setMessage("اكتملت محاولة المزامنة. راجع العمليات المعلقة أدناه.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page title="حالة المزامنة">
      <Card>
        <h2 className="font-bold">{outbox.length} عملية معلقة</h2>
        <Note>
          {isOnline ? "المتصفح متصل بالشبكة" : "المتصفح غير متصل بالشبكة"}
        </Note>
        <Note>
          تبقى العمليات التي لم تصل إلى الخادم في حسابك على هذا المتصفح وتُعاد
          المحاولة. لا تُعد العملية محفوظة في الخادم إلا بعد استجابته بنجاح.
        </Note>
        <Action onClick={sync} disabled={busy}>
          {busy ? "جارٍ المزامنة…" : "إعادة المزامنة"}
        </Action>
        <ErrorMessage error={error} />
        {message && <p role="status">{message}</p>}
      </Card>
      {outbox.map((item) => (
        <Card key={item.id}>
          <p>
            {{
              account: "عميل",
              visit: "زيارة",
              appointment: "موعد",
              agreement: "اتفاق",
              discount_request: "طلب خصم",
            }[item.type] || item.type}{" "}
            —{" "}
            {item.status === "failed"
              ? "تحتاج إعادة محاولة"
              : item.status === "syncing"
                ? "قيد الإرسال"
                : "بانتظار الإرسال"}
          </p>
          <Note>{new Date(item.timestamp).toLocaleString("ar")}</Note>
        </Card>
      ))}
      {!outbox.length && <Note>لا توجد عمليات في قائمة الانتظار.</Note>}
    </Page>
  );
}

export function Settings() {
  return (
    <Page title="الإعدادات">
      <Card>
        <h2 className="font-bold">اللغة والمظهر</h2>
        <p>العربية — المظهر الداكن</p>
        <Note>واجهة مصممة للعمل على الهاتف والمتصفح.</Note>
      </Card>
      <Card>
        <h2 className="font-bold">البيانات</h2>
        <Note>
          تتم مزامنة العملاء والزيارات والمواعيد والاتفاقات مع الخادم. لا تمسح
          بيانات المتصفح قبل اكتمال إرسال العمليات المعلقة.
        </Note>
        <Link style={{ color: "var(--color-primary)" }} to="/app/sync-status">
          عرض حالة المزامنة
        </Link>
      </Card>
      <Card>
        <h2 className="font-bold">الحساب</h2>
        <Link style={{ color: "var(--color-primary)" }} to="/app/profile-new">
          تعديل بياناتي
        </Link>
      </Card>
    </Page>
  );
}

export function Help() {
  return (
    <Page title="المساعدة">
      <Card>
        <h2 className="font-bold">كيف أبدأ؟</h2>
        <ol className="list-decimal list-inside space-y-3">
          <li>ابدأ الدوام من الشاشة الرئيسية.</li>
          <li>أضف عميلاً مع بيانات التواصل وموقعه الصحيح.</li>
          <li>افتح العميل وابدأ زيارة، ثم سجل ملاحظاتك.</li>
          <li>أكمل الزيارة باتفاق موقع أو موعد أو متابعة أو سبب رفض.</li>
          <li>راجع حالة المزامنة للتأكد من إرسال البيانات إلى الخادم.</li>
        </ol>
      </Card>
      <Card>
        <h2 className="font-bold">تعذر تسجيل الدخول أو الحفظ</h2>
        <Note>
          خطأ الشبكة يعني تعذر الوصول إلى الخادم. أما رسالة بيانات الدخول غير
          الصحيحة فتعني أن الخادم رفض البريد أو كلمة المرور. في التشغيل المحلي،
          يجب إبقاء نافذة تشغيل المشروع مفتوحة.
        </Note>
      </Card>
      <Card>
        <h2 className="font-bold">الموقع والتوقيع</h2>
        <Note>
          اسمح للمتصفح باستخدام الموقع أو أدخل الإحداثيات الصحيحة يدوياً.
          الاتفاق يُحفظ مع التوقيع، ويمكن فتحه من سجل العميل وطباعته أو حفظه PDF
          من نافذة الطباعة.
        </Note>
      </Card>
    </Page>
  );
}
