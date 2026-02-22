"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "en" | "ar";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    appName: "Darb",
    requestRide: "Request Ride",
    cancelRide: "Cancel Ride",
    estimatedPrice: "Estimated Price",
    min: "min",
    accept: "Accept",
    reject: "Reject",
    rejectReason: "Rejection Reason",
    traffic: "Heavy Traffic",
    tooFar: "Too Far",
    vehicleIssue: "Vehicle Issue",
    personal: "Personal Reason",
    other: "Other",
    rideRequested: "Ride Requested",
    driverOnWay: "Driver on the way",
    arrived: "Arrived",
    inProgress: "Trip in Progress",
    completed: "Completed",
    chat: "Chat",
    send: "Send",
    support: "Support",
    dashboard: "Dashboard",
    riders: "Riders",
    drivers: "Drivers",
    analytics: "Analytics",
    rejections: "Rejections",
    avgTime: "Avg. Time",
    peakSurge: "Peak Surge Active",
    invoice: "Invoice",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    enterEmail: "Enter your email",
    sendResetLink: "Send Reset Link",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    checkEmail: "Check your email for the reset link",
    signIn: "Sign In",
    signUp: "Create Account",
    createAccount: "Create Account",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    passwordMismatch: "Passwords do not match",
    passwordMin: "Password must be at least 6 characters",
  },
  ar: {
    appName: "درب",
    requestRide: "طلب رحلة",
    cancelRide: "إلغاء الرحلة",
    estimatedPrice: "السعر المقدر",
    min: "د",
    accept: "قبول",
    reject: "رفض",
    rejectReason: "سبب الرفض",
    traffic: "ازدحام مروري",
    tooFar: "بعيد جداً",
    vehicleIssue: "مشكلة في المركبة",
    personal: "سبب شخصي",
    other: "آخر",
    rideRequested: "تم طلب الرحلة",
    driverOnWay: "السائق في الطريق",
    arrived: "وصل",
    inProgress: "الرحلة جارية",
    completed: "مكتملة",
    chat: "محادثة",
    send: "إرسال",
    support: "الدعم",
    dashboard: "لوحة التحكم",
    riders: "الركاب",
    drivers: "السائقون",
    analytics: "التحليلات",
    rejections: "الرفض",
    avgTime: "متوسط الوقت",
    peakSurge: "ذروة الأسعار نشطة",
    invoice: "فاتورة",
    forgotPassword: "نسيت كلمة السر؟",
    resetPassword: "إعادة تعيين كلمة السر",
    enterEmail: "أدخل بريدك الإلكتروني",
    sendResetLink: "إرسال رابط الإعادة",
    newPassword: "كلمة السر الجديدة",
    confirmPassword: "تأكيد كلمة السر",
    updatePassword: "تحديث كلمة السر",
    checkEmail: "تحقق من بريدك للإرسال رابط الإعادة",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    createAccount: "إنشاء حساب جديد",
    haveAccount: "لديك حساب؟",
    noAccount: "ليس لديك حساب؟",
    passwordMismatch: "كلمات السر غير متطابقة",
    passwordMin: "كلمة السر 6 أحرف على الأقل",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darb-locale") as Locale | null;
    if (stored && (stored === "ar" || stored === "en")) setLocaleState(stored);
    setMounted(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("darb-locale", l);
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    }
  };

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("locale-ar", locale === "ar");
    document.documentElement.classList.toggle("locale-en", locale === "en");
  }, [locale, mounted]);

  const t = (key: string) => translations[locale][key] ?? key;

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRTL: locale === "ar",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}
