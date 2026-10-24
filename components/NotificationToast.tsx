"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Radio, Sparkles, X, Bell } from "lucide-react";

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "ai_analysis" | "rescue_team" | "resolved" | "info";
  timestamp?: number;
  autoClose?: number; // ms, 기본 6초
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    bg: "bg-red-950/95 border-red-500/60",
    iconBg: "bg-red-600",
    iconColor: "text-white",
    titleColor: "text-red-300",
    badge: "🚨 긴급",
    badgeClass: "bg-red-500 text-white",
  },
  ai_analysis: {
    icon: Sparkles,
    bg: "bg-blue-950/95 border-blue-500/60",
    iconBg: "bg-blue-600",
    iconColor: "text-white",
    titleColor: "text-blue-300",
    badge: "🤖 AI 분석",
    badgeClass: "bg-blue-500 text-white",
  },
  rescue_team: {
    icon: Radio,
    bg: "bg-amber-950/95 border-amber-500/60",
    iconBg: "bg-amber-600",
    iconColor: "text-white",
    titleColor: "text-amber-300",
    badge: "🚁 구조대",
    badgeClass: "bg-amber-500 text-white",
  },
  resolved: {
    icon: CheckCircle2,
    bg: "bg-emerald-950/95 border-emerald-500/60",
    iconBg: "bg-emerald-600",
    iconColor: "text-white",
    titleColor: "text-emerald-300",
    badge: "✅ 완료",
    badgeClass: "bg-emerald-500 text-white",
  },
  info: {
    icon: Bell,
    bg: "bg-slate-900/95 border-slate-600/60",
    iconBg: "bg-slate-600",
    iconColor: "text-white",
    titleColor: "text-slate-300",
    badge: "ℹ️ 알림",
    badgeClass: "bg-slate-500 text-white",
  },
};

function SingleToast({
  notification,
  onDismiss,
}: {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = typeConfig[notification.type] || typeConfig.info;
  const Icon = config.icon;

  const dismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(notification.id), 400);
  }, [notification.id, onDismiss]);

  useEffect(() => {
    // 슬라이드-인 애니메이션
    requestAnimationFrame(() => setIsVisible(true));

    // 자동 닫기
    const autoClose = notification.autoClose || 6000;
    const timer = setTimeout(dismiss, autoClose);

    return () => clearTimeout(timer);
  }, [dismiss, notification.autoClose]);

  const timeStr = new Date(notification.timestamp || Date.now()).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className={`
        transform transition-all duration-400 ease-out
        ${isVisible && !isLeaving ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"}
      `}
    >
      <div
        className={`
          ${config.bg} backdrop-blur-xl border rounded-2xl p-4 shadow-2xl
          min-w-[320px] max-w-[420px] cursor-pointer
          hover:brightness-110 transition-all
        `}
        onClick={dismiss}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`${config.iconBg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
            notification.type === "alert" ? "animate-pulse" : ""
          }`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                  {config.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{timeStr}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss();
                }}
                className="text-slate-500 hover:text-white transition-colors p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className={`text-sm font-extrabold mt-1.5 ${config.titleColor}`}>
              {notification.title}
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        <div className="mt-3 h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/30 rounded-full"
            style={{
              animation: `shrink ${notification.autoClose || 6000}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function NotificationToast({
  notifications,
  onDismiss,
}: NotificationToastProps) {
  if (notifications.length === 0) return null;

  return (
    <>
      {/* CSS keyframes for progress bar */}
      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div className="fixed top-4 right-4 z-[9990] flex flex-col gap-3 pointer-events-auto">
        {notifications.map((notif) => (
          <SingleToast
            key={notif.id}
            notification={notif}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </>
  );
}
