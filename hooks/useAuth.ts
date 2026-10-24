"use client";

import { useState, useEffect } from "react";
import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types/petition";
import { cleanStudentName } from "@/lib/petitionUtils";

const SCHOOL_DOMAIN = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN || "school.hs.kr";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        const email = firebaseUser.email || "";
        
        // 1. School email domain validation
        if (SCHOOL_DOMAIN && !email.endsWith(`@${SCHOOL_DOMAIN}`)) {
          const isDev = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key";
          const isAdminAccount = email === "520stevekim@gmail.com" || email.startsWith("admin");
          
          if (!isDev && !isAdminAccount && !email.endsWith(`@${SCHOOL_DOMAIN}`)) {
            setError(`로그인 실패: @${SCHOOL_DOMAIN} 학교 전용 이메일만 사용 가능합니다.`);
            await firebaseSignOut(auth);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        }

        setUser(firebaseUser);

        // 2. Fetch or create Firestore user profile
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const shouldBeAdmin = email.startsWith("admin") || email === "520stevekim@gmail.com";
          const cleanName = cleanStudentName(firebaseUser.displayName);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const updates: Partial<UserProfile> = {};
            if (shouldBeAdmin && data.role !== "admin") {
              updates.role = "admin";
            }
            if (data.displayName !== cleanName) {
              updates.displayName = cleanName;
            }

            if (Object.keys(updates).length > 0) {
              await setDoc(userRef, updates, { merge: true });
              setUserProfile({ ...data, ...updates });
            } else {
              setUserProfile(data);
            }
          } else {
            // New user registration - default role: 'student' or 'admin'
            const defaultRole: UserRole = shouldBeAdmin ? "admin" : "student";
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: cleanName,
              photoURL: firebaseUser.photoURL || undefined,
              role: defaultRole,
              createdAt: serverTimestamp(),
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
  }, []);

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || "";

      // Instant domain validation check
      if (SCHOOL_DOMAIN && !email.endsWith(`@${SCHOOL_DOMAIN}`)) {
        const isDev = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock_key";
        const isAdminAccount = email === "520stevekim@gmail.com" || email.startsWith("admin");
        if (!isDev && !isAdminAccount) {
          await firebaseSignOut(auth);
          const domainErr = `로그인 제한: 계정(${email})은 학교 전용 도메인(@${SCHOOL_DOMAIN})이 아닙니다.`;
          setError(domainErr);
          throw new Error(domainErr);
        }
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

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error("Logout Error:", err);
    }
  };

  return {
    user,
    userProfile,
    displayName: cleanStudentName(userProfile?.displayName || user?.displayName || "학생"),
    role: userProfile?.role || "student",
    isAdmin: userProfile?.role === "admin",
    loading,
    error,
    loginWithGoogle,
    logout,
    schoolDomain: SCHOOL_DOMAIN,
  };
}
