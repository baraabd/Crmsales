import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useApp } from "../../contexts/AppContext";
import { Action, Card, ErrorMessage, Field, Note } from "../connected/ui";

export function Login() {
  const { login, isAuthenticated, authReady, authError } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (authReady && isAuthenticated)
    return <Navigate to="/app/home-new" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate("/app/home-new", { replace: true });
    } catch (e) {
      setError((e as Error).message || "تعذر تسجيل الدخول.");
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
          <p
            className="font-bold tracking-widest"
            style={{ color: "var(--color-primary)" }}
          >
            CRM SALES
          </p>
          <h1 className="text-3xl font-bold">تسجيل الدخول</h1>
          <Note>أدخل بيانات حسابك للمتابعة</Note>
        </div>
        <Card>
          <form onSubmit={submit} className="space-y-4">
            <Field
              label="البريد الإلكتروني"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
              style={{ direction: "ltr", textAlign: "left" }}
            />
            <Field
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={busy}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              إظهار كلمة المرور
            </label>
            <ErrorMessage error={error || authError || ""} />
            <Action
              type="submit"
              disabled={busy || !authReady}
              className="w-full"
            >
              {busy ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
            </Action>
          </form>
        </Card>
        <div className="text-center space-y-4">
          <Link
            className="block"
            style={{ color: "var(--color-primary)" }}
            to="/auth/register"
          >
            ليس لديك حساب؟ إنشاء حساب
          </Link>
          <Link
            className="block text-sm"
            style={{ color: "var(--text-secondary)" }}
            to="/auth/forgot-password"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
      </div>
    </main>
  );
}
