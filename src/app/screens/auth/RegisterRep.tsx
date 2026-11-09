import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useApp } from "../../contexts/AppContext";
import { Action, Card, ErrorMessage, Field, Note } from "../connected/ui";

export function RegisterRep() {
  const { register, isAuthenticated, authReady } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (authReady && isAuthenticated)
    return <Navigate to="/app/home-new" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setBusy(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        company: company.trim(),
      });
      navigate("/app/home-new", { replace: true });
    } catch (e) {
      setError((e as Error).message || "تعذر إنشاء الحساب.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main
      dir="rtl"
      className="h-full overflow-y-auto p-5"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-md mx-auto py-10 space-y-6">
        <div className="text-center space-y-2">
          <p className="font-bold" style={{ color: "var(--color-primary)" }}>
            CRM SALES
          </p>
          <h1 className="text-3xl font-bold">إنشاء حساب</h1>
          <Note>أنشئ حسابك وابدأ إدارة عملائك وزياراتك</Note>
        </div>
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Field
              label="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              minLength={2}
              maxLength={120}
              required
              disabled={busy}
            />
            <Field
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              disabled={busy}
              style={{ direction: "ltr", textAlign: "left" }}
            />
            <Field
              label="الشركة (اختياري)"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              maxLength={160}
              disabled={busy}
            />
            <Field
              label="كلمة المرور"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={200}
              disabled={busy}
            />
            <Field
              label="تأكيد كلمة المرور"
              type="password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={200}
              disabled={busy}
            />
            <Note>استخدم كلمة مرور من 8 أحرف على الأقل.</Note>
            <ErrorMessage error={error} />
            <Action
              type="submit"
              className="w-full"
              disabled={busy || !authReady}
            >
              {busy ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
            </Action>
          </form>
        </Card>
        <Link
          className="block text-center"
          to="/auth/login"
          style={{ color: "var(--color-primary)" }}
        >
          لديك حساب؟ تسجيل الدخول
        </Link>
      </div>
    </main>
  );
}
