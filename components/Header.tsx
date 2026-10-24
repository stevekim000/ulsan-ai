"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { PenSquare, LogIn, LogOut, CheckCircle2, User as UserIcon, Search, Users } from "lucide-react";

import { siteConfig } from "@/lib/siteConfig";

export function Header() {
  const { user, displayName, isAdmin, loginWithGoogle, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Main Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md flex-shrink-0 bg-blue-50 flex items-center justify-center border border-blue-100">
            <span className="text-xl">🏫</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">{siteConfig.name}</span>
            </div>
            <p className="text-xs text-slate-500">{siteConfig.schoolName} 학생 청원 플랫폼</p>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/petitions/new"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <PenSquare className="w-4 h-4" />
            <span className="hidden sm:inline">청원 작성하기</span>
          </Link>

          {!mounted ? (
            <div className="w-20 h-9 bg-slate-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center space-x-2 sm:space-x-3 border-l border-slate-200 pl-2 sm:pl-3">
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className="p-2 text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                  title="사용자 및 권한 관리"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden lg:inline">사용자 관리</span>
                </Link>
              )}

              <Link
                href="/mypage"
                className="hidden md:flex flex-col text-right p-1.5 rounded-lg hover:bg-slate-100 transition-colors group/user"
                title="마이페이지 바로가기"
              >
                <span className="text-xs font-bold text-slate-800 group-hover/user:text-blue-600 flex items-center justify-end space-x-1">
                  <span>{displayName}</span>
                  {isAdmin && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200 flex items-center">
                      <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> 관리자
                    </span>
                  )}
                </span>
                <span className="text-[11px] text-slate-500 font-mono truncate max-w-[140px]">
                  {user.email}
                </span>
              </Link>

              <Link
                href="/mypage"
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                title="마이페이지"
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">마이페이지</span>
              </Link>

              <button
                onClick={logout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <>
              <a
                href="https://script.google.com/a/macros/usja.hs.kr/s/AKfycbylWQxH6vpHkCZ8lcdP19zlSA7hVPxswq7F_c5oZJeHfQ2_RuvB1npng-YpmmQOiGtHwQ/exec"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 hover:text-blue-600 text-slate-700 text-sm font-medium transition-colors"
                title="학번 찾기 (새 창으로 이동)"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">학번 찾기</span>
              </a>

              <button
                onClick={loginWithGoogle}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                <span>로그인</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
