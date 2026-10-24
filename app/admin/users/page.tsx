"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile, UserRole } from "@/types/petition";
import { formatDate } from "@/lib/petitionUtils";
import { siteConfig } from "@/lib/siteConfig";
import { 
  Users, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft,
  UserCheck,
  GraduationCap,
  Briefcase
} from "lucide-react";

const ROLE_LABELS: Record<UserRole, { label: string; color: string }> = {
  student: { label: "일반 학생", color: "bg-slate-100 text-slate-700 border-slate-200" },
  council: { label: "학생회 임원", color: "bg-blue-100 text-blue-800 border-blue-200" },
  teacher: { label: "교직원", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  admin: { label: "최고 관리자", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        users.push({ uid: d.id, ...d.data() } as UserProfile);
      });
      setUsersList(users);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      // Firestore 인덱스나 권한 이슈 시 fallback
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const users: UserProfile[] = [];
        snapshot.forEach((d) => {
          users.push({ uid: d.id, ...d.data() } as UserProfile);
        });
        setUsersList(users);
      } catch (e: any) {
        setMessage({ type: "error", text: "사용자 목록을 불러오지 못했습니다: " + e.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin]);

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    setUpdatingUid(targetUid);
    setMessage(null);
    try {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      setMessage({ type: "success", text: "권한이 성공적으로 변경되었습니다." });
    } catch (err: any) {
      console.error("Role update error:", err);
      setMessage({ type: "error", text: "권한 변경 실패: " + err.message });
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleStatusToggle = async (targetUid: string, currentStatus?: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    setUpdatingUid(targetUid);
    setMessage(null);
    try {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { status: newStatus });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, status: newStatus } : u))
      );
      setMessage({
        type: "success",
        text: `계정이 ${newStatus === "suspended" ? "정지" : "활성화"}되었습니다.`,
      });
    } catch (err: any) {
      console.error("Status update error:", err);
      setMessage({ type: "error", text: "상태 변경 실패: " + err.message });
    } finally {
      setUpdatingUid(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">접근 권한이 없습니다</h2>
        <p className="text-xs text-slate-500">
          사용자 관리 페이지는 학생회 임원 또는 최고 관리자만 접근할 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>홈으로 돌아가기</span>
        </Link>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.studentNumber || "").includes(searchTerm);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>사용자 및 권한 관리</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">
            Firebase Authentication 및 Firestore에 등록된 사용자를 조회하고 역할(학생, 학생회, 관리자)을 부여합니다.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>새로고침</span>
        </button>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="이름, 이메일, 학번으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
        >
          <option value="all">전체 역할 (전체)</option>
          <option value="student">일반 학생</option>
          <option value="council">학생회 임원</option>
          <option value="teacher">교직원</option>
          <option value="admin">최고 관리자</option>
        </select>
      </div>

      {/* Users Count Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 font-medium">전체 등록 유저</p>
          <p className="text-xl font-black text-slate-900 mt-1">{usersList.length}명</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-blue-600 font-medium">학생회 임원</p>
          <p className="text-xl font-black text-blue-700 mt-1">
            {usersList.filter((u) => u.role === "council").length}명
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-emerald-600 font-medium">교직원</p>
          <p className="text-xl font-black text-emerald-700 mt-1">
            {usersList.filter((u) => u.role === "teacher").length}명
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[11px] text-purple-600 font-medium">최고 관리자</p>
          <p className="text-xl font-black text-purple-700 mt-1">
            {usersList.filter((u) => u.role === "admin").length}명
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-600" />
            사용자 목록을 불러오는 중입니다...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            조건에 일치하는 사용자가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">사용자 (이름 / 이메일)</th>
                  <th className="py-3 px-4">학적 정보</th>
                  <th className="py-3 px-4">현재 역할</th>
                  <th className="py-3 px-4">가입일</th>
                  <th className="py-3 px-4 text-right">역할 변경 / 권한 설정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const roleConfig = ROLE_LABELS[u.role] || ROLE_LABELS.student;
                  const isUpdating = updatingUid === u.uid;
                  const isSuspended = u.status === "suspended";

                  return (
                    <tr key={u.uid} className={`hover:bg-slate-50/80 transition-colors ${isSuspended ? "opacity-60 bg-red-50/20" : ""}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                            {u.displayName?.slice(0, 1) || "학"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center space-x-1.5">
                              <span>{u.displayName || "이름 미등록"}</span>
                              {isSuspended && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-semibold">
                                  정지됨
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {u.grade ? `${u.grade}학년 ` : ""}
                        {u.classNum ? `${u.classNum}반 ` : ""}
                        {u.studentNumber ? `(${u.studentNumber})` : (u.department || "-")}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${roleConfig.color}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {formatDate(u.createdAt) || "-"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <select
                            disabled={isUpdating}
                            value={u.role || "student"}
                            onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:border-blue-500 shadow-sm"
                          >
                            <option value="student">일반 학생</option>
                            <option value="council">학생회 임원</option>
                            <option value="teacher">교직원</option>
                            <option value="admin">최고 관리자</option>
                          </select>

                          <button
                            onClick={() => handleStatusToggle(u.uid, u.status)}
                            disabled={isUpdating}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                              isSuspended
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                          >
                            {isSuspended ? "정지 해제" : "계정 정지"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
