import { Link } from "react-router";
import { Card, Note } from "../connected/ui";

export function ForgotPassword() {
  return (
    <main
      dir="rtl"
      className="h-full overflow-y-auto p-5"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <div className="w-full max-w-md mx-auto py-10 space-y-5">
        <h1 className="text-2xl font-bold">استعادة كلمة المرور</h1>
        <Card>
          <Note>
            إرسال رسائل استعادة كلمة المرور غير متاح في إعداد الخادم الحالي.
            تواصل مع مسؤول النظام لاستعادة الوصول إلى حسابك.
          </Note>
          <Note>لم يتم إرسال أي رسالة بريد إلكتروني.</Note>
        </Card>
        <Link style={{ color: "var(--color-primary)" }} to="/auth/login">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    </main>
  );
}
