"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { LogIn, CheckCircle2, AlertCircle, School } from "lucide-react";

import { siteConfig } from "@/lib/siteConfig";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle, loading, error, schoolDomain } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/");
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6 text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden mx-auto shadow-md bg-blue-50 flex items-center justify-center border border-blue-100">
          <span className="text-2xl">🏫</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{siteConfig.name} 로그인</h1>
          <p className="text-xs text-slate-500 mt-1">
            {siteConfig.schoolName} 전용 계정(@{schoolDomain})으로 로그인하세요.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-start space-x-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {user ? (
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <p className="text-xs text-slate-600">이미 로그인되어 있습니다.</p>
            <p className="text-sm font-bold text-slate-800">{user.email}</p>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              메인으로 이동
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>구글 계정으로 로그인</span>
          </button>
        )}

        <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-500">
          <p className="font-bold text-slate-700 flex items-center">
            <School className="w-3.5 h-3.5 mr-1 text-blue-600" />
            학교 계정 인증 규칙
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
            <li>특정 학교 도메인(@{schoolDomain}) 계정만 액세스가 허용됩니다.</li>
            <li>학생회 임원 계정은 자동으로 <span className="font-bold text-purple-700">admin</span> 권한이 부여됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
