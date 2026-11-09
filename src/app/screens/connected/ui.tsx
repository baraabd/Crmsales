import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router";

export const fieldStyle = {
  background: "var(--bg-input)",
  color: "var(--text-primary)",
  border: "1px solid var(--border-color)",
  borderRadius: 12,
  padding: "12px 14px",
  width: "100%",
};
export function Page({
  title,
  children,
  back,
}: {
  title: string;
  children: ReactNode;
  back?: string;
}) {
  return (
    <section
      dir="rtl"
      className="h-full overflow-y-auto"
      style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}
    >
      <div
        className="max-w-3xl mx-auto p-5 space-y-5"
        style={{ paddingBottom: 110 }}
      >
        {back && (
          <Link
            to={back}
            className="inline-block text-sm"
            style={{ color: "var(--color-primary)" }}
          >
            ← رجوع
          </Link>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {children}
      </div>
    </section>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`p-4 rounded-2xl space-y-3 ${className}`}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
      }}
    >
      {children}
    </div>
  );
}
export function Action({
  children,
  secondary = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ""}`}
      style={{
        background: secondary ? "var(--bg-card-hover)" : "var(--color-primary)",
        color: secondary ? "var(--text-primary)" : "#07150d",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}
export function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      <input {...props} style={{ ...fieldStyle, ...props.style }} />
    </label>
  );
}
export function Note({ children }: { children: ReactNode }) {
  return (
    <p
      className="text-sm leading-relaxed"
      style={{ color: "var(--text-secondary)" }}
    >
      {children}
    </p>
  );
}
export function ErrorMessage({ error }: { error: string }) {
  return error ? (
    <p
      role="alert"
      className="p-3 rounded-xl text-sm"
      style={{ background: "#ff3b471a", color: "var(--color-red)" }}
    >
      {error}
    </p>
  ) : null;
}
export const lifecycleLabels = {
  prospect: "عميل محتمل",
  cold: "اهتمام منخفض",
  warm: "مهتم",
  customer: "عميل فعلي",
  lost: "غير مهتم",
};
export const outcomeLabels = {
  deal: "اتفاق",
  appointment: "موعد",
  busy: "متابعة",
  rejected: "رفض",
};
export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
