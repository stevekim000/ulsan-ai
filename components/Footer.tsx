"use client";

import React from "react";
import Image from "next/image";

import { siteConfig } from "@/lib/siteConfig";

export function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-slate-800 flex items-center justify-center border border-slate-700">
              <span className="text-base">🏫</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">{siteConfig.name}</p>
              <p className="text-slate-400 text-[11px]">
                {siteConfig.schoolName} 학생 청원 플랫폼
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-slate-500 gap-2">
          <p>© Ulsan Joong Ang High School&킴범주. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

