"use client";

import React, { useEffect, useRef } from "react";
import { Student, AIEstimateResult, LocationCandidate } from "@/types/rescue";
import { HALLASAN_LANDMARKS, HALLASAN_TRAILS, TrailName } from "@/lib/mountainData";

interface MountainMapProps {
  students: Student[];
  selectedStudent?: Student;
  aiEstimate?: AIEstimateResult | null;
  height?: string;
  selectedCourse?: TrailName;
  onSelectCandidateCourse?: (course: TrailName) => void;
}

export default function MountainMap({
  students,
  selectedStudent,
  aiEstimate,
  height = "480px",
  selectedCourse,
  onSelectCandidateCourse,
}: MountainMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useEffect(() => {
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

      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      // 한라산 백록담 중심 (5개 코스 전체 조망)
      const map = L.map(mapContainerRef.current, {
        center: [33.365, 126.535],
        zoom: 12,
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

  // 학생 데이터나 AI 결과, 선택된 코스가 바뀔 때 레이어 갱신
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;
    import("leaflet").then((mod) => {
      renderMapLayers(mod.default);
    });
  }, [students, selectedStudent, aiEstimate, selectedCourse]);

  const renderMapLayers = (L: any) => {
    if (!layerGroupRef.current || !mapInstanceRef.current) return;
    layerGroupRef.current.clearLayers();

    // 1. 한라산 5개 코스별 등산로 폴리라인 그리기
    Object.entries(HALLASAN_TRAILS).forEach(([trailName, trail]) => {
      const isSelectedCourse = selectedCourse === trailName;
      const trailCoords = trail.keyPoints.map((p) => [p.lat, p.lng]);
      const polyline = L.polyline(trailCoords as [number, number][], {
        color: trail.color,
        weight: isSelectedCourse ? 6 : 4,
        opacity: isSelectedCourse ? 1.0 : 0.8,
        smoothFactor: 1,
      }).addTo(layerGroupRef.current);

      polyline.bindTooltip(
        `<b>${trailName} 탐방로</b> (${trail.totalDistanceKm}km, 약 ${trail.expectedHours}시간, 종점: ${trail.endPointName})`,
        { sticky: true, className: "trail-tooltip" }
      );
    });

    // 2. 해발 1,500m 고도 구간 실제 지형 데이터 기반 하이라이트
    // (5개 코스에서 해발 1450m~1550m 사이의 실제 키포인트 구간을 청록색 점선 링으로 강조)
    const contourPoints1500: Array<{ lat: number; lng: number; name: string; course: string }> = [
      { lat: 33.3711, lng: 126.5678, name: "성판악 1500m (진달래밭 대피소)", course: "성판악" },
      { lat: 33.3527, lng: 126.4751, name: "영실 1500m (오백나한 조망터)", course: "영실" },
      { lat: 33.3871, lng: 126.5270, name: "관음사 1500m (삼각봉 대피소)", course: "관음사" },
      { lat: 33.3697, lng: 126.4731, name: "어리목 1550m (사제비동산)", course: "어리목" },
      { lat: 33.3465, lng: 126.5432, name: "돈내코 1530m (넓은드르)", course: "돈내코" },
    ];

    contourPoints1500.forEach((cp) => {
      const ringHtml = `
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(14, 165, 233, 0.4);
          border: 2px solid #0284c7;
          box-shadow: 0 0 8px #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: white;
          font-weight: 900;
        ">
          15
        </div>
      `;
      const ringIcon = L.divIcon({
        className: "contour-1500-ring",
        html: ringHtml,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const ringMarker = L.marker([cp.lat, cp.lng], { icon: ringIcon }).addTo(layerGroupRef.current);
      ringMarker.bindTooltip(`<b>${cp.name}</b><br/><span style="color:#0284c7;">실제 해발 1,500m 등고선 통과 지점</span>`, {
        direction: "top",
      });
    });

    // 3. 한라산 5개 코스 주요 랜드마크 POI 마커 추가
    HALLASAN_LANDMARKS.forEach((poi) => {
      const isSummit = poi.type === "ridge" || poi.name.includes("정상");
      const isShelter = poi.type === "shelter";

      const iconHtml = `
        <div style="
          background-color: ${isSummit ? "#dc2626" : isShelter ? "#2563eb" : "#059669"};
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        ">
          ${isSummit ? "🚩" : isShelter ? "🏠" : poi.type === "spring" ? "💧" : "📍"}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-poi-marker",
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: customIcon }).addTo(
        layerGroupRef.current
      );

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 13px; color: #1e293b;">
            ${poi.name}
          </h4>
          <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">
            해발 <b>${poi.altitude}m</b> | 구분: ${poi.type}
          </p>
          <p style="margin: 0; font-size: 11px; color: #334155;">
            ${poi.description}
          </p>
        </div>
      `);
    });

    // 4. 학생 궤적(locationHistory) 표시 (조난 학생은 붉은 점선)
    students.forEach((std) => {
      const isEmergency = std.status === "emergency";

      if (std.locationHistory && std.locationHistory.length > 1) {
        const historyCoords = std.locationHistory.map((p) => [p.lat, p.lng]);

        L.polyline(historyCoords as [number, number][], {
          color: isEmergency ? "#ef4444" : "#10b981",
          weight: 3,
          dashArray: "8, 6",
          opacity: 0.7,
        }).addTo(layerGroupRef.current);

        std.locationHistory.forEach((point, idx) => {
          const isLast = idx === std.locationHistory.length - 1;
          const timeStr = new Date(point.timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const dotHtml = `
            <div style="
              width: ${isLast ? "14px" : "10px"};
              height: ${isLast ? "14px" : "10px"};
              border-radius: 50%;
              background-color: ${isEmergency ? (isLast ? "#ef4444" : "#f87171") : "#10b981"};
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ${isLast && isEmergency ? "animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;" : ""}
            "></div>
          `;

          const dotIcon = L.divIcon({
            className: "custom-trail-dot",
            html: dotHtml,
            iconSize: [isLast ? 14 : 10, isLast ? 14 : 10],
            iconAnchor: [isLast ? 7 : 5, isLast ? 7 : 5],
          });

          const dotMarker = L.marker([point.lat, point.lng], { icon: dotIcon }).addTo(
            layerGroupRef.current
          );

          dotMarker.bindPopup(`
            <div style="padding: 4px; font-family: sans-serif; min-width: 140px;">
              <p style="margin: 0; font-size: 12px; font-weight: bold; color: ${isEmergency ? "#dc2626" : "#059669"};">
                📍 궤적 포인트 #${idx + 1}
              </p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">
                시각: <b>${timeStr}</b>
              </p>
              <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">
                해발: <b>${point.altitude || "측정중"}m</b>
              </p>
            </div>
          `);
        });
      }
    });

    // 5. 학생 마커 표시
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

    // 6. 분산 후보군 마커 표시 (핵심 기능: 5개 코스 후보 순위 및 점수 뱃지 표시)
    if (aiEstimate && aiEstimate.candidates && aiEstimate.candidates.length > 0) {
      aiEstimate.candidates.forEach((cand) => {
        const isTarget = selectedCourse === cand.course;

        const candHtml = `
          <div style="position: relative; cursor: pointer;">
            ${isTarget ? `<div style="
                position: absolute;
                top: -6px; left: -6px;
                width: 44px; height: 44px;
                border-radius: 50%;
                background: rgba(16, 185, 129, 0.4);
                animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              "></div>` : ""}
            <div style="
              background-color: ${isTarget ? "#059669" : "#1e293b"};
              color: white;
              padding: 3px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: 800;
              white-space: nowrap;
              border: 2px solid ${isTarget ? "#10b981" : "#f59e0b"};
              box-shadow: 0 4px 10px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              gap: 3px;
            ">
              <span style="background:#f59e0b; color:#0f172a; padding:1px 3px; border-radius:4px; font-size:9px;">#${cand.rank}</span>
              <span>${cand.course}</span>
              <span style="color:#fbbf24; font-size:9px;">(${cand.candidateScore}점)</span>
            </div>
          </div>
        `;

        const candIcon = L.divIcon({
          className: "custom-candidate-marker",
          html: candHtml,
          iconSize: [85, 22],
          iconAnchor: [42, 11],
        });

        const candMarker = L.marker([cand.coordinates.lat, cand.coordinates.lng], { icon: candIcon })
          .addTo(layerGroupRef.current);

        candMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; min-width: 180px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <b style="color:${isTarget ? "#059669" : "#d97706"}; font-size:12px;">
                후보 ${cand.rank}위: ${cand.course} 코스
              </b>
              <span style="font-size:10px; background:#fef3c7; color:#92400e; padding:1px 4px; border-radius:4px; font-weight:bold;">
                후보점수 ${cand.candidateScore}점
              </span>
            </div>
            <p style="margin: 0; font-size: 11px; color: #1e293b;">
              <b>대표 지점:</b> ${cand.keyLandmark}
            </p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">
              <b>추정 구역:</b> ${cand.estimatedArea}
            </p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #64748b;">
              위치 신뢰도: <b>${cand.locationConfidence}%</b> (단일 고도 단서)
            </p>
          </div>
        `);

        candMarker.on("click", () => {
          if (onSelectCandidateCourse) {
            onSelectCandidateCourse(cand.course);
          }
        });
      });
    }

    // 7. AI 위치 특정 결과 (수색 추천 반경 원형 표시)
    if (aiEstimate) {
      const circle = L.circle([aiEstimate.estimatedLat, aiEstimate.estimatedLng], {
        color: aiEstimate.isAltitudeOnlyDispersed ? "#f59e0b" : "#dc2626",
        fillColor: aiEstimate.isAltitudeOnlyDispersed ? "#fbbf24" : "#ef4444",
        fillOpacity: aiEstimate.isAltitudeOnlyDispersed ? 0.15 : 0.25,
        radius: aiEstimate.radiusMeters,
        weight: 2,
        dashArray: "4, 6",
      }).addTo(layerGroupRef.current);

      circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <p style="margin: 0; font-weight: bold; color: ${aiEstimate.isAltitudeOnlyDispersed ? "#d97706" : "#dc2626"}; font-size: 13px;">
            ${aiEstimate.isAltitudeOnlyDispersed ? "⚠️ AI 고도 분산 후보 대역 (불확실성 명시)" : "🤖 AI 특정 수색 타깃 영역"}
          </p>
          <p style="margin: 2px 0; font-size: 11px; color: #334155;">
            중심: <b>${aiEstimate.matchedPOI?.name}</b>
          </p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">
            수색 추천 반경: <b>${aiEstimate.radiusMeters}m</b> (신뢰도: ${aiEstimate.confidence}%)
          </p>
        </div>
      `);

      // 맵 이동: 선택된 코스가 있으면 해당 코스 좌표로, 없으면 추정 좌표로
      const targetLat = selectedCourse && aiEstimate.candidates
        ? (aiEstimate.candidates.find((c) => c.course === selectedCourse)?.coordinates.lat || aiEstimate.estimatedLat)
        : aiEstimate.estimatedLat;
      const targetLng = selectedCourse && aiEstimate.candidates
        ? (aiEstimate.candidates.find((c) => c.course === selectedCourse)?.coordinates.lng || aiEstimate.estimatedLng)
        : aiEstimate.estimatedLng;

      mapInstanceRef.current.flyTo([targetLat, targetLng], 14, { duration: 1.0 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-900">
      <div ref={mapContainerRef} style={{ height, width: "100%" }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-[11px] text-slate-300 shadow-xl flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold text-slate-200 mr-1 border-r border-slate-700 pr-2">
          <span>한라산 5대 탐방로</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#FF9800" }}></span>
          <span>영실</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#4CAF50" }}></span>
          <span>성판악</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#2196F3" }}></span>
          <span>관음사</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#9C27B0" }}></span>
          <span>어리목</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: "#00BCD4" }}></span>
          <span>돈내코</span>
        </div>
        <div className="flex items-center space-x-1 border-l border-slate-700 pl-2">
          <span className="w-3 h-3 rounded-full bg-sky-500/30 border border-sky-400 inline-flex items-center justify-center text-[7px] text-white font-bold">15</span>
          <span>1,500m 고도선</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1 border-l border-slate-700 pl-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
          <span>조난 학생</span>
        </div>
      </div>
    </div>
  );
}
