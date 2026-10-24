import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "산울림 AI - 수학여행 산악 조난 긴급 구조 & 안심 관제 시스템",
  description:
    "산악 통신 음영 지역에서도 작동하는 오프라인 GPS와 음성 랜드마크 분석 AI를 통해 학생을 신속 구조하고, 교직원과 학부모 간 신뢰를 구축하는 안전 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
