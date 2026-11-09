import { useRef, useState } from "react";
import type { PointerEvent } from "react";
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

const services = [
  {
    id: "1",
    name: "باقة أساسية",
    price: 1000,
    description: "هوية بصرية وموقع إلكتروني",
    category: "package",
  },
  {
    id: "2",
    name: "باقة متقدمة",
    price: 2500,
    description: "خدمات رقمية وتسويق للشركات",
    category: "package",
  },
  {
    id: "3",
    name: "باقة احترافية",
    price: 5000,
    description: "حلول رقمية متكاملة للشركات",
    category: "package",
  },
  {
    id: "4",
    name: "استشارة تسويقية",
    price: 500,
    description: "جلسة استشارية لمدة ساعتين",
    category: "service",
  },
  {
    id: "5",
    name: "تدريب فريق",
    price: 1500,
    description: "تدريب على أدوات التسويق",
    category: "service",
  },
  {
    id: "6",
    name: "تصميم هوية بصرية",
    price: 800,
    description: "شعار وهوية بصرية متكاملة",
    category: "service",
  },
  {
    id: "7",
    name: "تطوير موقع إلكتروني",
    price: 3000,
    description: "موقع إلكتروني متجاوب",
    category: "service",
  },
  {
    id: "8",
    name: "إدارة سوشيال ميديا",
    price: 2000,
    description: "إدارة حسابات التواصل لمدة شهر",
    category: "service",
  },
];
const money = (n: number) =>
  `${n.toLocaleString("ar", { maximumFractionDigits: 2 })} ر.س`;

export function ServiceList() {
  const { currentVisit } = useApp();
  return (
    <Page title="الخدمات والباقات">
      <Note>
        كتالوج الخدمات الحالي للمشروع. تُسجّل الأسعار المختارة في الاتفاق عند
        إتمام زيارة.
      </Note>
      {services.map((service) => (
        <Card key={service.id}>
          <h2 className="font-bold">{service.name}</h2>
          <Note>{service.description}</Note>
          <p style={{ color: "var(--color-primary)" }}>
            {money(service.price)}
          </p>
        </Card>
      ))}
      {currentVisit && (
        <Link
          to={`/dropin/services/${currentVisit.id}`}
          style={{ color: "var(--color-primary)" }}
        >
          إنشاء اتفاق للزيارة الجارية
        </Link>
      )}
    </Page>
  );
}

export function CreateAgreement() {
  const { visitId } = useParams();
  const navigate = useNavigate();
  const {
    currentVisit,
    accounts,
    user,
    addAgreement,
    endVisit,
    updateAccount,
    canAddData,
  } = useApp();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [discountPercent, setDiscountPercent] = useState(0);
  const [months, setMonths] = useState(1);
  const [startDate, setStartDate] = useState(localDate());
  const [implementation, setImplementation] = useState("standard");
  const [payment, setPayment] = useState("50-50");
  const [notes, setNotes] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const selected = services
    .filter((s) => quantities[s.id] > 0)
    .map((s) => ({ ...s, quantity: quantities[s.id] }));
  const subtotal = selected.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const discount = Math.round(subtotal * discountPercent) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;
  const end = new Date(`${startDate}T12:00:00`);
  const startDay = end.getDate();
  end.setDate(1);
  end.setMonth(end.getMonth() + months);
  const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  end.setDate(Math.min(startDay, lastDay));
  const endDate = Number.isFinite(end.getTime()) ? localDate(end) : startDate;
  if (!currentVisit || currentVisit.id !== visitId)
    return <Navigate to="/app/home-new" replace />;
  const account = accounts.find((a) => a.id === currentVisit.accountId);
  const position = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (600 / rect.width),
      y: (e.clientY - rect.top) * (200 / rect.height),
    };
  };
  const startDrawing = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const p = position(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    drawing.current = true;
  };
  const draw = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const p = position(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setSigned(true);
  };
  const clear = () => {
    canvas.current?.getContext("2d")?.clearRect(0, 0, 600, 200);
    setSigned(false);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!selected.length) {
      setError("اختر خدمة واحدة على الأقل.");
      return;
    }
    if (selected.filter((s) => s.category === "package").length > 1) {
      setError("اختر باقة واحدة فقط، ويمكنك إضافة خدمات منفردة معها.");
      return;
    }
    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 10
    ) {
      setError("الخصم المتاح في هذه النسخة من 0 إلى 10%.");
      return;
    }
    if (!signed || !accepted) {
      setError("يلزم توقيع العميل والموافقة على الاتفاق.");
      return;
    }
    if (!canvas.current) return;
    setSaving(true);
    try {
      const percentages =
        payment === "100"
          ? [100]
          : payment === "25-25-25-25"
            ? [25, 25, 25, 25]
            : [50, 50];
      let paid = 0;
      const paymentDates = percentages.map((percentage, index) => {
        const date = new Date(`${startDate}T12:00:00`);
        const span = new Date(`${endDate}T12:00:00`).getTime() - date.getTime();
        date.setTime(
          date.getTime() +
            (percentages.length === 1
              ? 0
              : (span * index) / (percentages.length - 1)),
        );
        const amount =
          index === percentages.length - 1
            ? Math.round((total - paid) * 100) / 100
            : Math.round(total * percentage) / 100;
        paid += amount;
        return { date: localDate(date), percentage, amount };
      });
      const agreement = addAgreement({
        accountId: currentVisit.accountId,
        visitId: currentVisit.id,
        agreementNumber: `CRM-${Date.now()}-${crypto.randomUUID().slice(0, 4)}`,
        services: selected,
        subtotal,
        discount,
        total,
        duration: String(months),
        durationLabel: `${months} شهر`,
        implementation,
        payment,
        paymentDates,
        customNotes: notes,
        signatureData: canvas.current.toDataURL("image/png"),
        status: "active",
        startDate,
        endDate,
      });
      updateAccount(currentVisit.accountId, {
        lifecycle: "customer",
        pinColor: "green",
        nextAction: { type: "none" },
      });
      const visitNote =
        localStorage.getItem(
          `crm:visit-notes:${user?.id}:${currentVisit.id}`,
        ) || "";
      endVisit(
        currentVisit.id,
        "deal",
        [visitNote, `اتفاق ${agreement.agreementNumber}`, notes]
          .filter(Boolean)
          .join("\n"),
      );
      navigate(`/app/agreements/${agreement.id}`);
    } catch (e) {
      setSaving(false);
      setError((e as Error).message);
    }
  };
  return (
    <Page title="الخدمات والاتفاق" back={`/dropin/outcome/${visitId}`}>
      <Card>
        <h2 className="font-bold text-lg">{account?.name}</h2>
        <Note>اختر الخدمات، راجع الشروط، ثم اطلب من العميل التوقيع.</Note>
      </Card>
      <form onSubmit={save} className="space-y-5">
        <Card>
          <h2 className="font-bold">الخدمات</h2>
          {services.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div>
                <label htmlFor={`qty-${s.id}`} className="font-semibold">
                  {s.name}
                </label>
                <Note>{money(s.price)}</Note>
              </div>
              <input
                id={`qty-${s.id}`}
                aria-label={`كمية ${s.name}`}
                type="number"
                min={0}
                max={s.category === "package" ? 1 : 100}
                value={quantities[s.id] || 0}
                onChange={(e) =>
                  setQuantities((q) => ({
                    ...q,
                    [s.id]: Math.max(
                      0,
                      Math.min(
                        s.category === "package" ? 1 : 100,
                        Math.floor(Number(e.target.value) || 0),
                      ),
                    ),
                  }))
                }
                style={{ ...fieldStyle, width: 88 }}
              />
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="font-bold">القيمة والشروط</h2>
          <Field
            label="نسبة الخصم (%)"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
          />
          <Note>
            الخصم الأقصى المتاح 10%. للخصومات الأكبر راجع مسؤول المبيعات.
          </Note>
          <p>المجموع: {money(subtotal)}</p>
          <p>الخصم: {money(discount)}</p>
          <strong className="text-xl" style={{ color: "var(--color-primary)" }}>
            الإجمالي: {money(total)}
          </strong>
          <Field
            label="تاريخ بدء الاتفاق"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <label className="block space-y-2">
            <span>مدة الاتفاق</span>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              style={fieldStyle}
            >
              {[1, 2, 3, 6, 12].map((m) => (
                <option value={m} key={m}>
                  {m} شهر
                </option>
              ))}
            </select>
          </label>
          <Note>ينتهي في {endDate}</Note>
          <label className="block space-y-2">
            <span>طريقة التنفيذ</span>
            <select
              style={fieldStyle}
              value={implementation}
              onChange={(e) => setImplementation(e.target.value)}
            >
              <option value="standard">تنفيذ قياسي</option>
              <option value="agile">تنفيذ مرن</option>
              <option value="phased">تنفيذ على مراحل</option>
              <option value="turnkey">تسليم متكامل</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span>خطة الدفع</span>
            <select
              style={fieldStyle}
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="100">دفعة كاملة عند البدء</option>
              <option value="50-50">50% عند البدء و50% عند الانتهاء</option>
              <option value="25-25-25-25">أربع دفعات متساوية خلال المدة</option>
            </select>
          </label>
          <label className="block space-y-2">
            <span>شروط وملاحظات إضافية</span>
            <textarea
              style={fieldStyle}
              rows={4}
              maxLength={4000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </Card>
        <Card>
          <h2 className="font-bold">توقيع العميل</h2>
          <Note>ارسم التوقيع داخل المساحة البيضاء.</Note>
          <canvas
            ref={canvas}
            width={600}
            height={200}
            aria-label="توقيع العميل"
            className="w-full rounded-xl"
            style={{ background: "#fff", touchAction: "none", height: 180 }}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={() => {
              drawing.current = false;
            }}
            onPointerCancel={() => {
              drawing.current = false;
            }}
          />
          <Action secondary onClick={clear}>
            مسح التوقيع
          </Action>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
              className="mt-1"
            />
            <span>
              أوافق على الخدمات والأسعار ومدة التنفيذ وخطة الدفع الموضحة في هذا
              الاتفاق.
            </span>
          </label>
        </Card>
        <ErrorMessage error={error} />
        <Action type="submit" disabled={saving || !canAddData}>
          {saving ? "جارٍ حفظ الاتفاق…" : "حفظ الاتفاق وإنهاء الزيارة"}
        </Action>
      </form>
    </Page>
  );
}

export function AgreementDetails() {
  const { agreementId } = useParams();
  const { agreements, accounts } = useApp();
  const agreement = agreements.find((a) => a.id === agreementId);
  if (!agreement)
    return (
      <Page title="الاتفاق غير موجود" back="/app/stats-new">
        <Note>راجع قائمة الاتفاقات المحفوظة في حسابك.</Note>
      </Page>
    );
  const account = accounts.find((a) => a.id === agreement.accountId);
  return (
    <Page
      title={`اتفاق ${agreement.agreementNumber}`}
      back={`/app/leads/${agreement.accountId}`}
    >
      <style>
        {
          "@media print { header, nav, button, a { display: none !important; } body { position: static !important; } body, #root, #root > div, section, main { height: auto !important; overflow: visible !important; } * { color: #111 !important; background: white !important; } }"
        }
      </style>
      <Card>
        <h2 className="font-bold text-xl">{account?.name}</h2>
        <Note>{account?.address}</Note>
        <Note>
          تاريخ الإنشاء: {new Date(agreement.createdAt).toLocaleString("ar")}
        </Note>
        <p>
          المدة: {agreement.startDate} إلى {agreement.endDate}
        </p>
        <p>
          طريقة التنفيذ:{" "}
          {{
            standard: "قياسي",
            agile: "مرن",
            phased: "على مراحل",
            turnkey: "تسليم متكامل",
          }[agreement.implementation] || agreement.implementation}
        </p>
      </Card>
      <Card>
        <h2 className="font-bold">الخدمات المتفق عليها</h2>
        {agreement.services.map((s, i) => (
          <p key={`${s.id}-${i}`}>
            {s.name} × {s.quantity} — {money(s.price * s.quantity)}
          </p>
        ))}
        <p>المجموع: {money(agreement.subtotal)}</p>
        <p>الخصم: {money(agreement.discount)}</p>
        <strong className="text-xl">الإجمالي: {money(agreement.total)}</strong>
      </Card>
      <Card>
        <h2 className="font-bold">جدول الدفع</h2>
        {agreement.paymentDates?.map((p, i) => (
          <p key={i}>
            {p.date} — {p.percentage}% — {money(p.amount)}
          </p>
        ))}
      </Card>
      {agreement.customNotes && (
        <Card>
          <h2 className="font-bold">شروط إضافية</h2>
          <p className="whitespace-pre-wrap">{agreement.customNotes}</p>
        </Card>
      )}
      {agreement.signatureData && (
        <Card>
          <h2 className="font-bold">توقيع العميل</h2>
          <img
            src={agreement.signatureData}
            alt="توقيع العميل المحفوظ على الاتفاق"
            className="max-w-full rounded-xl"
            style={{ background: "#fff" }}
          />
        </Card>
      )}
      <Action onClick={() => window.print()}>طباعة الاتفاق / حفظ PDF</Action>
    </Page>
  );
}
