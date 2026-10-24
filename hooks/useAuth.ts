"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types/petition";
import { cleanStudentName } from "@/lib/petitionUtils";
import { siteConfig } from "@/lib/siteConfig";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkIsAdminEmail = useCallback((email: string) => {
    const lower = email.toLowerCase();
    return (
      siteConfig.adminEmails.includes(lower) ||
      lower.startsWith("admin@") ||
      lower.startsWith("admin.")
    );
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        const email = (firebaseUser.email || "").toLowerCase();
        const schoolDomain = siteConfig.domain;
        
        // 1. 학교 이메일 도메인 검증
        const isSchoolEmail = !schoolDomain || email.endsWith(`@${schoolDomain}`);
        const isAdmin = checkIsAdminEmail(email);
        const isDev = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key";

        if (!isSchoolEmail && !isAdmin && !isDev) {
          setError(`로그인 제한: @${schoolDomain} 학교 전용 이메일 계정만 사용할 수 있습니다.`);
          await firebaseSignOut(auth);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);

        // 2. Firestore `users/{uid}` 프로필 조회 및 동기화
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const cleanName = cleanStudentName(firebaseUser.displayName);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const updates: Partial<UserProfile> = {
              lastLoginAt: serverTimestamp(),
            };

            // 관리자 목록에 포함된 계정이면 role 승격
            if (isAdmin && data.role !== "admin") {
              updates.role = "admin";
            }
            if (cleanName && (!data.displayName || data.displayName === "학생")) {
              updates.displayName = cleanName;
            }

            await updateDoc(userRef, updates);
            setUserProfile({ ...data, ...updates });
          } else {
            // 신규 사용자 등록 (기본 role: 관리자 이메일이면 'admin', 아니면 'student')
            const defaultRole: UserRole = isAdmin ? "admin" : "student";
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: cleanName,
              photoURL: firebaseUser.photoURL || undefined,
              role: defaultRole,
              status: "active",
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err: any) {
          console.error("Firestore user profile error:", err);
          setError("사용자 프로필 정보를 불러오는 중 오류가 발생했습니다.");
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkIsAdminEmail]);

  // 구글 팝업 로그인
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user.email || "").toLowerCase();
      const schoolDomain = siteConfig.domain;

      const isSchoolEmail = !schoolDomain || email.endsWith(`@${schoolDomain}`);
      const isAdmin = checkIsAdminEmail(email);
      const isDev = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key";

      if (!isSchoolEmail && !isAdmin && !isDev) {
        await firebaseSignOut(auth);
        const domainErr = `로그인 제한: 계정(${email})은 학교 전용 도메인(@${schoolDomain})이 아닙니다.`;
        setError(domainErr);
        throw new Error(domainErr);
      }
      return result.user;
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        console.error("Google Login Error:", err);
        setError(err.message || "구글 로그인에 실패했습니다.");
      }
      throw err;
    }
  };

  // 사용자 정보 업데이트 (학년, 반, 학번, 이름 등)
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error("로그인이 필요합니다.");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  const role = userProfile?.role || "student";
  const isAdmin = role === "admin" || role === "council";
  const isSuperAdmin = role === "admin";
  const isCouncil = role === "council";
  const isTeacher = role === "teacher";

  return {
    user,
    userProfile,
    displayName: cleanStudentName(userProfile?.displayName || user?.displayName || "학생"),
    role,
    isAdmin,          // 학생회 또는 관리자 (청원 답변, 검토 권한)
    isSuperAdmin,     // 최고 관리자 (유저 관리, 삭제 권한)
    isCouncil,        // 학생회 임원
    isTeacher,        // 교직원
    loading,
    error,
    loginWithGoogle,
    logout,
    updateUserProfile,
    schoolDomain: siteConfig.domain,
  };
}
