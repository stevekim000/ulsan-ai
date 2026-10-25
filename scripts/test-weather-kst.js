// scripts/test-weather-kst.js
// KMA 단기예보 KST 기준 시각 및 시간대별 필터링 단위 테스트

function getKSTDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((p) => p.type === type)?.value || "00";

  const year = parseInt(getPart("year"), 10);
  const month = parseInt(getPart("month"), 10);
  const day = parseInt(getPart("day"), 10);
  let hour = parseInt(getPart("hour"), 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(getPart("minute"), 10);
  const second = parseInt(getPart("second"), 10);

  const yearStr = String(year);
  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");

  const dateKey = `${yearStr}${monthStr}${dayStr}`;
  const timeKey = `${hourStr}00`;
  const isoStringKST = `${yearStr}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00+09:00`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    yearStr,
    monthStr,
    dayStr,
    hourStr,
    minuteStr,
    dateKey,
    timeKey,
    isoStringKST,
  };
}

const kst = getKSTDate();
console.log(`[1] 현재 대한민국 표준시(KST): ${kst.year}-${kst.monthStr}-${kst.dayStr} ${kst.hourStr}:${kst.minuteStr}:${String(kst.second).padStart(2, "0")}`);

// 기상청 API에서 반환하는 과거 08:00 발표 기준 Mock 아이템들
// (09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00 ...)
const mockKmaKeys = [
  `${kst.dateKey}_0900`,
  `${kst.dateKey}_1000`,
  `${kst.dateKey}_1100`,
  `${kst.dateKey}_1200`,
  `${kst.dateKey}_1300`,
  `${kst.dateKey}_1400`,
  `${kst.dateKey}_1500`,
  `${kst.dateKey}_1600`,
  `${kst.dateKey}_1700`,
  `${kst.dateKey}_1800`,
  `${kst.dateKey}_1900`,
  `${kst.dateKey}_2000`,
  `${kst.dateKey}_2100`,
  `${kst.dateKey}_2200`,
  `${kst.dateKey}_2300`,
];

const currentKstKey = `${kst.dateKey}_${kst.hourStr}00`;
let validKeys = mockKmaKeys.filter((k) => k >= currentKstKey);
if (validKeys.length === 0) {
  validKeys = mockKmaKeys.slice(0, 12);
}
const targetKeys = validKeys.slice(0, 12);

console.log(`[2] 필터링 기준 KST Key: ${currentKstKey}`);
console.log(`[3] 필터링 후 첫 번째 시간대 Key (지금): ${targetKeys[0]}`);

const firstHourNum = parseInt(targetKeys[0].slice(9, 11), 10);
const firstTimeDisplay = `지금 (${firstHourNum}시)`;

if (firstHourNum === kst.hour) {
  console.log(`✅ [PASS] 첫 시간대가 현재 KST 시각(${kst.hour}시)과 정확히 일치함: ${firstTimeDisplay}`);
} else {
  console.error(`❌ [FAIL] 첫 시간대 불일치: ${firstHourNum} vs ${kst.hour}`);
  process.exit(1);
}

console.log(`[4] 향후 12시간 시간표 목록:`);
targetKeys.forEach((k, idx) => {
  const h = parseInt(k.slice(9, 11), 10);
  const label = idx === 0 ? `지금 (${h}시)` : `${String(h).padStart(2, "0")}:00`;
  console.log(`   - [${idx}] ${label} (Key: ${k})`);
});

console.log(`\n🎉 모든 KST 시간대 검증 통과!`);
