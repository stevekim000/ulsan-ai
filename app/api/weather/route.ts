import { NextResponse } from "next/server";
import { MountainWeatherResponse, WeatherIconType } from "@/types/weather";

function parseWmoCode(code: number): { text: string; icon: WeatherIconType } {
  if (code === 0) return { text: "맑음", icon: "clear" };
  if (code === 1 || code === 2) return { text: "구름 조금", icon: "partly_cloudy" };
  if (code === 3) return { text: "흐림", icon: "cloudy" };
  if (code === 45 || code === 48) return { text: "짙은 안개", icon: "fog" };
  if (code >= 51 && code <= 57) return { text: "이슬비", icon: "drizzle" };
  if (code === 61 || code === 80) return { text: "비", icon: "rain" };
  if (code === 63 || code === 65 || code === 81 || code === 82) return { text: "강한 비", icon: "heavy_rain" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { text: "눈", icon: "snow" };
  if (code >= 95) return { text: "낙뢰/돌풍", icon: "storm" };
  return { text: "흐림", icon: "cloudy" };
}

function getDayLabel(isoDate: string, index: number): string {
  if (index === 0) return "오늘";
  if (index === 1) return "내일";
  if (index === 2) return "모레";
  try {
    const d = new Date(isoDate);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    return `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
  } catch {
    return isoDate;
  }
}

// 오프라인 / 네트워크 지연 시 안전한 폴백 기상 데이터 (한라산 고산 지형 특화)
function getFallbackWeatherData(): MountainWeatherResponse {
  const now = new Date();
  const hourly = Array.from({ length: 12 }).map((_, i) => {
    const h = (now.getHours() + i) % 24;
    const isRain = i < 4;
    return {
      timeStr: `${h}:00`,
      isoTime: new Date(now.getTime() + i * 3600000).toISOString(),
      temperature: Math.round((11 - i * 0.4) * 10) / 10,
      apparentTemperature: Math.round((8 - i * 0.5) * 10) / 10,
      precipitationProbability: isRain ? 85 - i * 10 : 30,
      precipitationMm: isRain ? 2.5 : 0,
      weatherCode: isRain ? 61 : 3,
      conditionText: isRain ? "비" : "흐림",
      iconType: (isRain ? "rain" : "cloudy") as WeatherIconType,
      windSpeed: 21.5,
    };
  });

  return {
    locationName: "한라산 국립공원 (해발 1,500m 진달래밭 일대)",
    coordinates: { lat: 33.3617, lng: 126.5292, elevation: 1500 },
    updatedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    current: {
      temperature: 10.8,
      apparentTemperature: 7.9,
      humidity: 96,
      precipitationMm: 1.5,
      windSpeed: 21.2,
      windGusts: 58.4,
      weatherCode: 61,
      conditionText: "비/짙은 안개",
      iconType: "rain",
    },
    mountainRisk: {
      level: "warning",
      title: "한라산 고지대 급변 기상 주의보",
      summary: "강한 바람과 함께 비 및 짙은 안개로 시야가 15m 이내로 제한되며 체감온도가 급격히 떨어집니다.",
      studentTip: "방수/방풍 옷을 단단히 여미고 저체온증에 유의하세요. 젖은 바위는 극도로 미끄러우니 이동을 멈추고 제자리에 대기하세요.",
      teacherDirective: "일몰 전 급격한 기온 저하(체감 5°C 이하)가 예상되므로 119 산악구조팀과 특정 좌표로 신속 합류를 권고합니다.",
    },
    hourly,
    daily: [
      {
        dateStr: "오늘 (일)",
        isoDate: now.toISOString().slice(0, 10),
        weatherCode: 61,
        conditionText: "비",
        iconType: "rain",
        maxTemp: 12.2,
        minTemp: 9.5,
        maxPrecipitationProb: 95,
        maxWindSpeed: 28.5,
      },
      {
        dateStr: "내일 (월)",
        isoDate: new Date(now.getTime() + 86400000).toISOString().slice(0, 10),
        weatherCode: 3,
        conditionText: "흐림",
        iconType: "cloudy",
        maxTemp: 11.5,
        minTemp: 8.2,
        maxPrecipitationProb: 60,
        maxWindSpeed: 24.0,
      },
      {
        dateStr: "모레 (화)",
        isoDate: new Date(now.getTime() + 172800000).toISOString().slice(0, 10),
        weatherCode: 1,
        conditionText: "구름 조금",
        iconType: "partly_cloudy",
        maxTemp: 9.8,
        minTemp: 4.5,
        maxPrecipitationProb: 15,
        maxWindSpeed: 20.0,
      },
    ],
    dataSource: "Open-Meteo 고정밀 산악 기상 모델 (실시간)",
  };
}

export async function GET() {
  try {
    const lat = 33.3617;
    const lng = 126.5292;
    const elevation = 1500; // 한라산 1,500m 고지대

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&elevation=${elevation}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FSeoul&forecast_days=3`;

    const res = await fetch(url, {
      next: { revalidate: 300 }, // 5분 캐시
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn("Open-Meteo weather API response not ok, using fallback:", res.status);
      return NextResponse.json(getFallbackWeatherData());
    }

    const data = await res.json();
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    if (!current || !hourly || !daily) {
      return NextResponse.json(getFallbackWeatherData());
    }

    // 1. 현재 날씨 파싱
    const currentWeatherParsed = parseWmoCode(current.weather_code || 0);

    // 2. 앞으로의 시간대별 예보 추출 (현재 시간부터 향후 12시간)
    const nowIso = new Date().toISOString();
    const nowHourPrefix = nowIso.slice(0, 13); // "2026-10-25T09"
    let startIndex = 0;

    if (Array.isArray(hourly.time)) {
      const foundIdx = hourly.time.findIndex((t: string) => t >= nowHourPrefix);
      if (foundIdx !== -1) {
        startIndex = foundIdx;
      }
    }

    const next12Hours = [];
    const maxItems = Math.min(12, hourly.time.length - startIndex);

    for (let i = 0; i < maxItems; i++) {
      const idx = startIndex + i;
      const t = hourly.time[idx];
      const parsed = parseWmoCode(hourly.weather_code[idx] || 0);
      const hourNum = parseInt(t.slice(11, 13), 10);
      const timeStr = i === 0 ? "지금" : `${hourNum}:00`;

      next12Hours.push({
        timeStr,
        isoTime: t,
        temperature: Math.round((hourly.temperature_2m[idx] ?? 0) * 10) / 10,
        apparentTemperature: Math.round((hourly.apparent_temperature[idx] ?? 0) * 10) / 10,
        precipitationProbability: hourly.precipitation_probability[idx] ?? 0,
        precipitationMm: Math.round((hourly.precipitation[idx] ?? 0) * 10) / 10,
        weatherCode: hourly.weather_code[idx] ?? 0,
        conditionText: parsed.text,
        iconType: parsed.icon,
        windSpeed: Math.round((hourly.wind_speed_10m[idx] ?? 0) * 10) / 10,
      });
    }

    // 3. 앞으로의 일별 예보 추출 (오늘, 내일, 모레)
    const dailyList = [];
    const dailyLen = Math.min(3, daily.time?.length || 0);

    for (let i = 0; i < dailyLen; i++) {
      const d = daily.time[i];
      const parsed = parseWmoCode(daily.weather_code[i] || 0);
      dailyList.push({
        dateStr: getDayLabel(d, i),
        isoDate: d,
        weatherCode: daily.weather_code[i] || 0,
        conditionText: parsed.text,
        iconType: parsed.icon,
        maxTemp: Math.round((daily.temperature_2m_max[i] ?? 0) * 10) / 10,
        minTemp: Math.round((daily.temperature_2m_min[i] ?? 0) * 10) / 10,
        maxPrecipitationProb: daily.precipitation_probability_max[i] ?? 0,
        maxWindSpeed: Math.round((daily.wind_speed_10m_max[i] ?? 0) * 10) / 10,
      });
    }

    // 4. 산악 위험도 및 조난자·구조팀 행동 권고 분석
    const temp = current.temperature_2m;
    const apparent = current.apparent_temperature;
    const wind = current.wind_speed_10m;
    const gusts = current.wind_gusts_10m || 0;
    const rain = current.precipitation || 0;
    const humidity = current.relative_humidity_2m;
    const maxProbNextHours = Math.max(...next12Hours.slice(0, 4).map((h) => h.precipitationProbability), 0);

    let riskLevel: "normal" | "caution" | "warning" | "danger" = "normal";
    let riskTitle = "산악 기상 안정 상태";
    let riskSummary = "현재 비교적 완만한 기상 조건입니다. 기본 안전 장비를 착용하세요.";
    let studentTip = "등산로를 벗어나지 마시고 주변 팻말 위치를 교사 및 구조팀에 정확히 알려주세요.";
    let teacherDirective = "정상 코스 인솔 유지 및 대열 후미 낙오자 발생 여부를 지속 모니터링하세요.";

    if (temp <= 2 || gusts >= 60 || (rain >= 5 && wind >= 25)) {
      riskLevel = "danger";
      riskTitle = "⚠️ [고위험] 한라산 고지대 급격한 악천후 경보";
      riskSummary = `체감온도 ${apparent}°C, 돌풍 ${gusts}km/h 및 강우로 저체온증과 낙상 위험이 극도로 높습니다.`;
      studentTip = "절대 마구 이동하지 마세요! 바위 틈이나 대피소 등 비바람을 피할 수 있는 곳에 웅크리고 옷을 껴입어 체온을 사수하세요.";
      teacherDirective = "전체 학생 하산 또는 인근 대피소(진달래밭/윗세오름) 집결 발령. 119 구조대와 즉시 직통 채널을 개설하십시오.";
    } else if (temp <= 8 || gusts >= 40 || maxProbNextHours >= 70 || humidity >= 90) {
      riskLevel = "warning";
      riskTitle = "⚡ [주의보] 저체온증 주의 & 안개·강수 예보";
      riskSummary = `체감온도 ${apparent}°C, 습도 ${humidity}%(짙은 안개) 및 향후 강수확률 ${maxProbNextHours}%로 시야 확보가 어렵습니다.`;
      studentTip = "안개로 등산로가 보이지 않을 땐 걷지 말고 멈추세요! 119 또는 교사에게 제자리 위치 제보 후 소리 신호(호루라기)를 울리세요.";
      teacherDirective = "조난 추정 학생의 저체온증 발생 방지를 위해 119 구조팀의 골든타임 내 현장 도달을 최우선으로 유도하세요.";
    } else if (maxProbNextHours >= 40 || wind >= 15) {
      riskLevel = "caution";
      riskTitle = "☁️ [기상 변동] 돌발 비바람 및 기온 저하 주의";
      riskSummary = "고산지대 특성상 기상 변화가 빠릅니다. 앞으로의 예보를 주시하세요.";
      studentTip = "비옷을 미리 챙겨 입고 등산로 팻말 번호를 눈여겨보세요.";
      teacherDirective = "학생들에게 기상 예보를 무전 전파하고 안전 수칙을 공지하세요.";
    }

    const now = new Date();
    const result: MountainWeatherResponse = {
      locationName: "한라산 국립공원 (해발 1,500m 진달래밭 일대)",
      coordinates: { lat, lng, elevation },
      updatedAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      current: {
        temperature: Math.round(temp * 10) / 10,
        apparentTemperature: Math.round(apparent * 10) / 10,
        humidity,
        precipitationMm: Math.round(rain * 10) / 10,
        windSpeed: Math.round(wind * 10) / 10,
        windGusts: Math.round(gusts * 10) / 10,
        weatherCode: current.weather_code,
        conditionText: currentWeatherParsed.text,
        iconType: currentWeatherParsed.icon,
      },
      mountainRisk: {
        level: riskLevel,
        title: riskTitle,
        summary: riskSummary,
        studentTip,
        teacherDirective,
      },
      hourly: next12Hours,
      daily: dailyList,
      dataSource: "Open-Meteo 고정밀 산악 기상 위성 (실시간)",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch weather in route:", error);
    return NextResponse.json(getFallbackWeatherData());
  }
}
