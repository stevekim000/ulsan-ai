// scripts/test-api-scenarios.js
// 한라산 5대 코스 위치 추정 시나리오 검증 스크립트

const BASE_URL = "http://localhost:3000";

const SCENARIOS = [
  {
    name: "1. 성판악 1-24 입력 (1단계 표지목 코드 매칭)",
    body: {
      voiceTranscript: "선생님, 친구들이랑 떨어졌는데 성판악 1-24 진달래밭 대피소 건물 근처이고 해발 1500m 표지석이 보여요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - POI 매칭:", res.matchedPOI?.name);
      console.log("   - 매칭 신뢰도:", res.confidence + "%");
      console.log("   - 수색 반경:", res.radiusMeters + "m");
      console.log("   - 좌표:", res.estimatedLat, res.estimatedLng);
      return res.confidence === 98 && res.radiusMeters <= 20;
    },
  },
  {
    name: "2. 병풍바위 입력 (3단계 지형지물 및 랜드마크 매칭)",
    body: {
      voiceTranscript: "주변에 병풍바위가 보이고 안개가 심해요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - POI 매칭:", res.matchedPOI?.name);
      console.log("   - 매칭 신뢰도:", res.confidence + "%");
      console.log("   - 지형 분석:", res.terrainAnalysis?.trailCourse);
      return res.matchedPOI?.name.includes("병풍바위");
    },
  },
  {
    name: "3. 영실코스 해발 1500m 입력 (4단계 코스명과 고도 결합)",
    body: {
      voiceTranscript: "영실코스 해발 1500m 지점인데 안개가 너무 심해요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - POI 매칭:", res.matchedPOI?.name);
      console.log("   - 매칭 신뢰도:", res.confidence + "%");
      console.log("   - 수색 반경:", res.radiusMeters + "m");
      return res.confidence >= 92 && res.matchedPOI?.name.includes("오백나한");
    },
  },
  {
    name: "4-A. 해발 1500m만 입력 (정보 부족 상태 & 5대 코스 분산 후보군 도출)",
    body: {
      voiceTranscript: "해발 1500m 표지판이 보여요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - 정보 부족 여부 (isInsufficientInfo):", res.isInsufficientInfo);
      console.log("   - 분산 후보 여부 (isAltitudeOnlyDispersed):", res.isAltitudeOnlyDispersed);
      console.log("   - 생성된 후보 수:", res.candidates?.length);
      if (res.candidates) {
        console.log("   - 각 후보 점수 (균등 20% 여부):", res.candidates.map(c => `${c.course}: ${c.candidateScore}점(신뢰도:${c.locationConfidence}%)`).join(", "));
      }
      const has5Candidates = res.candidates?.length === 5;
      const allEqual20 = res.candidates?.every(c => c.candidateScore === 20);
      const confIs35 = res.candidates?.every(c => c.locationConfidence === 35);
      return has5Candidates && allEqual20 && confIs35;
    },
  },
  {
    name: "4-B. 해발 1500m만 입력 + 추가 제시 불가 (4-1단계 5대 코스 분산 추정 확정)",
    body: {
      voiceTranscript: "해발 1500m 표지판이 보여요. 안개가 너무 심해서 더 이상 보이는 게 없어요.",
      forceJudgment: true,
    },
    validate: (res) => {
      console.log("   - 단일 판단 여부 (isSingleInfoJudgment):", res.isSingleInfoJudgment);
      console.log("   - 분산 후보 여부 (isAltitudeOnlyDispersed):", res.isAltitudeOnlyDispersed);
      console.log("   - 생성된 후보 수:", res.candidates?.length);
      console.log("   - 추정 위치 (단정하지 않고 등고선 대역):", res.matchedPOI?.name);
      console.log("   - 위치 신뢰도 (98% 조작 없는 솔직한 신뢰도):", res.confidence + "%");
      const has5Candidates = res.candidates?.length === 5;
      const allEqual20 = res.candidates?.every(c => c.candidateScore === 20);
      return has5Candidates && allEqual20 && res.confidence === 35;
    },
  },
  {
    name: "5. 단서가 서로 모순되는 경우 (성판악 표지목 + 영실 병풍바위)",
    body: {
      voiceTranscript: "성판악 1-24 표지판이 보이는데 주변에 영실 병풍바위가 있어요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - 최우선 순위 매칭:", res.matchedPOI?.name);
      console.log("   - 신뢰도:", res.confidence + "%");
      // 표지목 고유 식별 코드가 최우선 우선순위(98%)로 매칭됨
      return res.matchedPOI?.keywords?.includes("성판악 1-24") || res.confidence === 98;
    },
  },
  {
    name: "6. 랜드마크를 찾을 수 없는 경우 (인터넷 실시간 정보 수집 모드 가동)",
    body: {
      voiceTranscript: "표지판은 안 보이고 모노레일 레일과 용암 석굴이 있어요.",
      forceJudgment: false,
    },
    validate: (res) => {
      console.log("   - 인터넷 정보 수집 모드 (isInternetSearchUsed):", res.isInternetSearchUsed);
      console.log("   - 추출된 검색어:", res.internetSearchQueries?.join(", "));
      console.log("   - 매칭 결과:", res.matchedPOI?.name);
      return res.isInternetSearchUsed === true || res.internetSearchQueries?.length > 0;
    },
  },
];

async function runTests() {
  console.log("=================================================");
  console.log(" 메아리 AI 위치 추정 6대 핵심 시나리오 자동 검증");
  console.log("=================================================\n");

  let passedCount = 0;

  for (const s of SCENARIOS) {
    console.log(`▶ [시나리오] ${s.name}`);
    try {
      const res = await fetch(`${BASE_URL}/api/analyze-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s.body),
      });

      if (!res.ok) {
        console.log(`   ❌ HTTP 오류: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const passed = s.validate(data);
      if (passed) {
        console.log("   ✅ 검증 성공 (PASS)\n");
        passedCount++;
      } else {
        console.log("   ❌ 검증 실패 (FAIL)\n");
      }
    } catch (e) {
      console.log(`   ❌ 예외 발생: ${e.message}\n`);
    }
  }

  console.log("=================================================");
  console.log(` 검증 완료: ${passedCount} / ${SCENARIOS.length} 통과`);
  console.log("=================================================");
}

runTests();
