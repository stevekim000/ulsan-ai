"use client";

import React, { useEffect, useRef } from "react";
import { Student, AIEstimateResult } from "@/types/rescue";
import { HALLASAN_LANDMARKS } from "@/lib/mountainData";

interface MountainMapProps {
  students: Student[];
  selectedStudent?: Student;
  aiEstimate?: AIEstimateResult | null;
  height?: string;
}

export default function MountainMap({
  students,
  selectedStudent,
  aiEstimate,
  height = "460px",
}: MountainMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic import of Leaflet on client side
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;

      // Leaflet 기본 CSS 로드
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // 한라산 중심 (진달래밭 대피소 부근)
      const map = L.map(mapContainerRef.current, {
        center: [33.365, 126.565],
        zoom: 13,
        zoomControl: true,
      });

      // 산악형 토포 / 위성 스타일 타일 레이어
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      if (isMounted) {
        renderMapLayers(L);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 학생 데이터나 AI 결과가 바뀔 때 레이어 갱신
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    import("leaflet").then((mod) => {
      renderMapLayers(mod.default);
    });
  }, [students, selectedStudent, aiEstimate]);

  const renderMapLayers = (L: any) => {
    if (!layerGroupRef.current || !mapInstanceRef.current) return;
    layerGroupRef.current.clearLayers();

    // 1. 성판악 탐방로 등산로 폴리라인 그리기
    const trailCoords = HALLASAN_LANDMARKS.map((p) => [p.lat, p.lng]);
    L.polyline(trailCoords, {
      color: "#2563eb",
      weight: 4,
      dashArray: "6, 8",
      opacity: 0.8,
    }).addTo(layerGroupRef.current);

    // 2. 한라산 랜드마크 POI 마커 추가
    HALLASAN_LANDMARKS.forEach((poi) => {
      const isSummit = poi.type === "ridge";
      const isShelter = poi.type === "shelter";

      const iconHtml = `
        <div style="
          background-color: ${isSummit ? "#dc2626" : isShelter ? "#2563eb" : "#059669"};
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${isSummit ? "🚩" : isShelter ? "🏠" : poi.type === "spring" ? "💧" : "📍"}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-poi-marker",
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(
        layerGroupRef.current
      );

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 14px; color: #1e293b;">
            ${poi.name}
          </h4>
          <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">
            해발 고도: <b>${poi.altitude}m</b> | 유형: ${poi.type}
          </p>
          <p style="margin: 0; font-size: 11px; color: #475569;">
            ${poi.description}
          </p>
        </div>
      `);
    });

    // 3. 학생 마커 표시 (조난 학생은 붉은 펄스 효과)
    students.forEach((std) => {
      const isEmergency = std.status === "emergency";
      const lat = std.lastLocation.lat;
      const lng = std.lastLocation.lng;

      const studentHtml = `
        <div style="position: relative;">
          ${
            isEmergency
              ? `<div style="
                  position: absolute;
                  top: -8px; left: -8px;
                  width: 48px; height: 48px;
                  border-radius: 50%;
                  background: rgba(239, 68, 68, 0.4);
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>`
              : ""
          }
          <div style="
            background-color: ${isEmergency ? "#ef4444" : "#10b981"};
            color: white;
            padding: 4px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${isEmergency ? "🚨 SOS" : "👤"}</span>
            <span>${std.name}</span>
          </div>
        </div>
      `;

      const studentIcon = L.divIcon({
        className: "custom-student-marker",
        html: studentHtml,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const marker = L.marker([lat, lng], { icon: studentIcon }).addTo(
        layerGroupRef.current
      );

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <h4 style="margin: 0 0 2px; font-weight: bold; color: ${isEmergency ? "#dc2626" : "#059669"};">
            ${isEmergency ? "🚨 조난 상태" : "✅ 안전 대열"}: ${std.name}
          </h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">
            배터리: ${std.battery}% | 통신: ${std.network === "offline" ? "두절(오프라인)" : "불안정(2G)"}
          </p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">
            측정 고도: <b>${std.lastLocation.altitude || "측정중"}m</b>
          </p>
        </div>
      `);
    });

    // 4. AI 위치 특정 결과 (수색 추천 반경 원형 표시)
    if (aiEstimate) {
      const circle = L.circle([aiEstimate.estimatedLat, aiEstimate.estimatedLng], {
        color: "#dc2626",
        fillColor: "#ef4444",
        fillOpacity: 0.25,
        radius: aiEstimate.radiusMeters,
        weight: 2,
        dashArray: "4, 6",
      }).addTo(layerGroupRef.current);

      circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <p style="margin: 0; font-weight: bold; color: #dc2626; font-size: 13px;">
            🤖 AI 특정 수색 타깃 영역
          </p>
          <p style="margin: 2px 0; font-size: 11px; color: #334155;">
            중심: <b>${aiEstimate.matchedPOI?.name}</b>
          </p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">
            수색 추천 반경: <b>${aiEstimate.radiusMeters}m</b> (신뢰도: ${aiEstimate.confidence}%)
          </p>
        </div>
      `);

      // AI 특정 위치로 지도 시점 부드럽게 이동
      mapInstanceRef.current.flyTo(
        [aiEstimate.estimatedLat, aiEstimate.estimatedLng],
        15,
        { duration: 1.2 }
      );
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-[11px] text-slate-300 shadow-xl flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>성판악 탐방로</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
          <span>조난 학생</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-3.5 h-2.5 border border-red-500 border-dashed bg-red-500/30 inline-block rounded"></span>
          <span>AI 특정 수색 반경</span>
        </div>
      </div>
    </div>
  );
}
