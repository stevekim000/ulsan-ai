import {
  HALLASAN_LANDMARKS,
  HALLASAN_SIGNS,
  LANDMARK_SYNONYMS,
  TrailName,
} from "@/lib/mountainData";

export interface KeywordDetectionResult {
  hasExplicitKeywords: boolean;
  detectedSignCode?: string;
  detectedGCode?: string;
  detectedAltitude?: number;
  detectedTrail?: TrailName;
  detectedLandmarks: string[];
  reason: string;
}

export interface WebSearchResultItem {
  query: string;
  title: string;
  snippet: string;
  url: string;
  courseTag?: TrailName; // 5대 코스 중 어느 코스에 해당하는지 태그
}

/**
 * 한라산 5대 공인 탐방로 (탐방로 입구 ~ 정상 구간) 정밀 지리 및 시설물 지식베이스
 * - 성판악 코스 (입구 750m ~ 백록담 정상 1,950m)
 * - 관음사 코스 (입구 620m ~ 백록담 북벽 정상 1,950m)
 * - 영실 코스 (입구 1,100m ~ 윗세오름 1,720m ~ 남벽분기점 1,600m)
 * - 어리목 코스 (입구 970m ~ 윗세오름 1,720m ~ 남벽분기점 1,600m)
 * - 돈내코 코스 (입구 490m ~ 남벽분기점 1,600m)
 */
export const HALLASAN_5_COURSES_KNOWLEDGE: Array<{
  course: TrailName;
  courseSection: string;
  keywords: string[];
  facilityDescription: string;
  title: string;
  url: string;
}> = [
  // 1. 성판악 코스 (입구 ~ 정상)
  {
    course: "성판악",
    courseSection: "성판악 코스 (성판악 탐방로 입구 750m ~ 백록담 동릉 정상 1,950m)",
    keywords: ["성판악", "탐방안내소", "삼나무", "속밭", "사라오름", "산정호수", "사라샘", "진달래밭", "붉은지붕", "기상레이더", "레이더", "돔", "철탑", "안테나", "백록담", "동릉"],
    facilityDescription: "성판악 코스 (입구 750m ~ 정상 1,950m): 성판악 탐방안내소 입구(750m) → 삼나무 숲길(850m) → 속밭 대피소(1,100m) → 사라오름 입구 및 분화구 산정호수(1,324m) → 진달래밭 대피소(1,500m, 붉은색 기와지붕 구조물 및 기상통제소) → 해발 1,800m 데크전망터 및 한라산 정상 백록담 북동사면 기상관측 레이더 돔·통신 철탑 시설 → 백록담 동릉 정상(1,950m).",
    title: "성판악 코스 (입구~정상) 시설물 및 지형 지리정보",
    url: "https://www.jeju.go.kr/hallasan/info/info/trail/seongpanak.htm",
  },
  // 2. 관음사 코스 (입구 ~ 정상)
  {
    course: "관음사",
    courseSection: "관음사 코스 (관음사 탐방로 입구 620m ~ 백록담 북벽 정상 1,950m)",
    keywords: ["관음사", "야영장", "구린굴", "석굴", "용암동굴", "탐라계곡", "목교", "모노레일", "레일", "개미등", "삼각봉", "용진각", "현수교", "출렁다리", "왕관릉", "헬기장", "북벽"],
    facilityDescription: "관음사 코스 (입구 620m ~ 정상 1,950m): 관음사지구 야영장 입구(620m) → 구린굴(720m, 천연 용암동굴/석굴) → 탐라계곡 목교(910m, 화물·구조용 단선 철제 산악 모노레일 레일 설치 구간) → 탐라계곡 대피소(950m) → 개미등(1,100m~1,300m 급경사 능선) → 삼각봉 대피소(1,500m, 피라미드형 삼각봉 앞 붉은/갈색 기와지붕 건물) → 용진각 현수교(1,600m 출렁다리) → 왕관릉(1,650m) → 헬기장(1,800m) → 백록담 북벽 정상(1,950m).",
    title: "관음사 코스 (입구~정상) 시설물 및 모노레일·동굴 지리정보",
    url: "https://www.jeju.go.kr/hallasan/info/info/trail/gwaneumsa.htm",
  },
  // 3. 영실 코스 (입구 ~ 정상권)
  {
    course: "영실",
    courseSection: "영실 코스 (영실 탐방로 입구 1,100m ~ 윗세오름 1,720m / 남벽분기점 1,600m)",
    keywords: ["영실", "통제소", "영실휴게소", "영실계곡", "병풍바위", "절벽", "오백나한", "오백장군", "영실기암", "바위기둥", "구상나무", "선작지왓", "평전", "윗세오름", "방아오름", "남벽분기점"],
    facilityDescription: "영실 코스 (입구 1,100m ~ 윗세오름 1,720m/남벽분기점 1,600m): 영실 통제소 매표소(1,100m) → 영실 휴게소(1,280m) → 영실계곡 목교(1,330m) → 병풍바위(1,400m~1,450m 수직 주상절리 기암절벽) → 오백나한(1,500m 영실기암 수백 개의 거대한 바위 돌기둥) → 구상나무 숲길(1,580m) → 선작지왓 현무암 화산석 평전(1,650m) → 윗세오름 대피소(1,720m) → 방아오름 샘터(1,670m) → 남벽분기점(1,600m 거대 암벽 아래).",
    title: "영실 코스 (입구~윗세오름·남벽분기점) 기암절벽 및 시설물 지리정보",
    url: "https://www.jeju.go.kr/hallasan/info/info/trail/yeongsil.htm",
  },
  // 4. 어리목 코스 (입구 ~ 정상권)
  {
    course: "어리목",
    courseSection: "어리목 코스 (어리목 탐방로 입구 970m ~ 윗세오름 1,720m / 남벽분기점 1,600m)",
    keywords: ["어리목", "탐방안내소", "목교", "어리목계곡", "사제비동산", "사제비샘", "약수터", "만세동산", "전망대", "윗세오름", "남벽분기점"],
    facilityDescription: "어리목 코스 (입구 970m ~ 윗세오름 1,720m/남벽분기점 1,600m): 어리목 탐방안내소 입구(970m) 및 어리목 목교 → 어리목계곡 숲길(1,040m) → 사제비동산 샘터 약수터(1,420m 가파른 숲길 끝) → 만세동산 전망대(1,600m 고산 오름 평원 조망터) → 윗세족은오름 갈림길(1,700m) → 윗세오름 대피소(1,720m) → 남벽분기점(1,600m).",
    title: "어리목 코스 (입구~윗세오름·남벽분기점) 숲길 및 샘터 지리정보",
    url: "https://www.jeju.go.kr/hallasan/info/info/trail/eorimok.htm",
  },
  // 5. 돈내코 코스 (입구 ~ 정상권)
  {
    course: "돈내코",
    courseSection: "돈내코 코스 (돈내코 탐방로 입구 490m ~ 남벽분기점 1,600m)",
    keywords: ["돈내코", "원앙폭포", "썩은물통", "살채기도", "평궤", "낭떠러지", "바위그늘", "남벽분기점", "남벽"],
    facilityDescription: "돈내코 코스 (입구 490m ~ 남벽분기점 1,600m): 돈내코 탐방안내소 입구(490m, 원앙폭포 계곡 인근) → 썩은물통 계곡 습지 웅덩이(900m) → 살채기도 난대림 돌길(1,100m) → 평궤 대피소(1,450m, 용암 암벽 낭떠러지 바위 그늘 천연 쉼터) → 남벽분기점(1,600m, 백록담 남벽 거대 수직 암벽 웅장한 조망터).",
    title: "돈내코 코스 (입구~남벽분기점) 평궤대피소 및 밀림 지형정보",
    url: "https://www.jeju.go.kr/hallasan/info/info/trail/donnaeko.htm",
  },
];

/**
 * 1. 음성 텍스트 내에서 명시적인 산악 지형 키워드(표지판, 국가지점번호, 고도 숫자, 코스명, 공식 랜드마크)가
 * 포함되어 있는지 여부를 정밀 판정하는 함수
 */
export function detectMountainKeywords(text: string): KeywordDetectionResult {
  const detectedLandmarks: string[] = [];

  // 1-1. 위치표지목 코드 검출 (예: "영실 1-14", "성판악 1-24")
  const signMatch = text.match(/(영실|성판악|관음사|어리목|돈내코|사라오름|남벽)\s*(\d+)\s*[-‐–—]\s*(\d+)/);
  const detectedSignCode = signMatch ? `${signMatch[1]} ${signMatch[2]}-${signMatch[3]}` : undefined;

  // 1-2. 국가지점번호 검출 (예: "다라 0155 8122", "다사 0670 7960")
  const gCodeMatch = text.match(/(다[라사])\s*(\d{4})\s*(\d{4})/);
  const detectedGCode = gCodeMatch ? `${gCodeMatch[1]} ${gCodeMatch[2]} ${gCodeMatch[3]}` : undefined;

  // 1-3. 명시적 해발 고도 검출 (예: "해발 1500m", "1500미터")
  let detectedAltitude: number | undefined;
  const altMatch = text.match(/해발\s*(\d{3,4})|(?:해발\s*)?(\d{3,4})\s*(?:m|M|미터)/);
  if (altMatch) {
    const val = parseInt(altMatch[1] || altMatch[2], 10);
    if (val >= 400 && val <= 2000) {
      detectedAltitude = val;
    }
  }

  // 1-4. 탐방로 코스명 검출
  let detectedTrail: TrailName | undefined;
  if (/영실\s*(?:코스|탐방로|길)?/.test(text)) detectedTrail = "영실";
  else if (/성판악\s*(?:코스|탐방로|길)?/.test(text)) detectedTrail = "성판악";
  else if (/관음사\s*(?:코스|탐방로|길)?/.test(text)) detectedTrail = "관음사";
  else if (/어리목\s*(?:코스|탐방로|길)?/.test(text)) detectedTrail = "어리목";
  else if (/돈내코\s*(?:코스|탐방로|길)?/.test(text)) detectedTrail = "돈내코";

  // 1-5. 등록된 공식 랜드마크 고유명사 검출
  const keyLandmarkNames = [
    "백록담", "진달래밭", "속밭", "사라오름", "윗세오름", "남벽분기점",
    "삼각봉", "용진각", "탐라계곡", "원앙폭포", "평궤", "사제비", "만세동산",
    "오백나한", "오백장군", "영실기암", "병풍바위", "선작지왓", "어승생악",
    "구린굴", "모세왓", "왕관릉", "개미등", "샘터", "살채기도", "볼레또왓"
  ];

  for (const name of keyLandmarkNames) {
    if (text.includes(name)) {
      detectedLandmarks.push(name);
    }
  }

  // 동의어 사전 매칭 검사
  for (const syn of LANDMARK_SYNONYMS) {
    for (const kw of syn.keywords) {
      if (text.includes(kw) && !detectedLandmarks.includes(syn.name)) {
        detectedLandmarks.push(syn.name);
      }
    }
  }

  const hasExplicitKeywords = Boolean(
    detectedSignCode ||
    detectedGCode ||
    detectedAltitude ||
    detectedTrail ||
    detectedLandmarks.length > 0
  );

  const reason = hasExplicitKeywords
    ? `명시적 키워드 감지됨: [${[
        detectedSignCode && `표지목: ${detectedSignCode}`,
        detectedGCode && `국가지점번호: ${detectedGCode}`,
        detectedAltitude && `고도: ${detectedAltitude}m`,
        detectedTrail && `코스: ${detectedTrail}`,
        detectedLandmarks.length > 0 && `랜드마크: ${detectedLandmarks.join(", ")}`,
      ].filter(Boolean).join(" | ")}]`
    : "음성에서 공인 표지목 코드, 코스명, 고도 수치 및 지정 랜드마크 키워드가 감지되지 않음 (5대 코스 인터넷 실시간 정보 수집 가동 대상)";

  return {
    hasExplicitKeywords,
    detectedSignCode,
    detectedGCode,
    detectedAltitude,
    detectedTrail,
    detectedLandmarks,
    reason,
  };
}

/**
 * 2. 키워드가 없는 음성 묘사에서 한라산 5대 코스 범위로 엄격히 한정된 인터넷 검색 쿼리를 생성하는 함수
 * 대상 5대 코스:
 * - 성판악 코스 (입구~정상)
 * - 관음사 코스 (입구~정상)
 * - 영실 코스 (입구~정상)
 * - 어리목 코스 (입구~정상)
 * - 돈내코 코스 (입구~정상)
 */
export function extractSearchQueriesFromVoice(text: string): string[] {
  const stopWords = [
    "선생님", "친구들", "친구들을", "놓쳤어요", "떨어졌어요", "길을", "잃었어요",
    "살려주세요", "도와주세요", "어디인지", "모르겠어요", "무서워요", "다쳤어요",
    "발목을", "삐었어요", "비가", "바람이", "너무", "진짜", "빨리", "방금",
    "여기", "주변에", "앞에", "보이고", "보여요", "있어요", "것 같아요",
    "표지판은", "안 보여요", "안보여요", "어떡해요", "춥고", "안개가", "자욱해요"
  ];

  let cleaned = text;
  for (const word of stopWords) {
    cleaned = cleaned.replaceAll(word, " ");
  }

  const terms = cleaned
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, " ")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2);

  const uniqueTerms = Array.from(new Set(terms));
  const queries: string[] = [];

  if (uniqueTerms.length > 0) {
    const cluePhrase = uniqueTerms.slice(0, 3).join(" ");
    
    // 5대 코스 범위 한정 쿼리 생성
    queries.push(`한라산 성판악 관음사 영실 어리목 돈내코 ${cluePhrase}`);
    queries.push(`한라산 5대 탐방로 코스 ${cluePhrase}`);

    // 시설물/지형 키워드가 있는 경우
    const facility = uniqueTerms.filter(t =>
      /건물|지붕|레이더|관측|돔|철탑|안테나|모노레일|레일|기지|사다리|목교|다리|석굴|동굴|바위|절벽|폭포|샘|신사|제단|비콘/.test(t)
    );
    if (facility.length > 0) {
      queries.push(`한라산 탐방로 입구 정상 ${facility.join(" ")} 위치`);
    }
  } else {
    queries.push("한라산 5개 탐방로 입구 정상 지형 시설물");
  }

  return Array.from(new Set(queries)).slice(0, 3);
}

/**
 * 3. 한라산 5개 코스(성판악, 관음사, 영실, 어리목, 돈내코: 입구~정상)에 관한 인터넷 정보를 실시간 수집 및 대조하는 함수
 */
export async function collectInternetInformation(
  queries: string[],
  voiceTranscript?: string
): Promise<WebSearchResultItem[]> {
  const allResults: WebSearchResultItem[] = [];
  const text = voiceTranscript || "";

  // 3-1. 라이브 웹 검색 수행 (한라산 5대 코스 범위 한정)
  for (const query of queries) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const html = await res.text();
      const items = html.split('<div class="result results_links results_links_deep web-result');

      for (let i = 1; i < items.length && allResults.length < 6; i++) {
        const block = items[i];
        const titleMatch = block.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
        const snippetMatch = block.match(/<a[^>]*class="[^"]*result__snippet"[^>]*>([\s\S]*?)<\/a>/);

        const rawUrl = titleMatch ? titleMatch[1] : "";
        let url = rawUrl;
        const urlParam = rawUrl.match(/uddg=([^&]+)/);
        if (urlParam) {
          try {
            url = decodeURIComponent(urlParam[1]);
          } catch {
            url = rawUrl;
          }
        }

        const title = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, "").trim() : "";
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, "").trim() : "";

        // 반드시 '한라산' 또는 5개 코스명(성판악/관음사/영실/어리목/돈내코) 관련 결과만 엄격히 수집
        const is5TrailRelated = /한라산|성판악|관음사|영실|어리목|돈내코/.test(title + " " + snippet);
        // 타 산악(설악산/지리산/북한산 등) 배제
        const isOtherMountain = /설악산|지리산|북한산|치악산|소백산|덕유산/.test(title + " " + snippet);

        if ((title || snippet) && is5TrailRelated && !isOtherMountain) {
          let courseTag: TrailName | undefined;
          if (/성판악/.test(title + snippet)) courseTag = "성판악";
          else if (/관음사/.test(title + snippet)) courseTag = "관음사";
          else if (/영실/.test(title + snippet)) courseTag = "영실";
          else if (/어리목/.test(title + snippet)) courseTag = "어리목";
          else if (/돈내코/.test(title + snippet)) courseTag = "돈내코";

          allResults.push({
            query,
            title,
            snippet,
            url,
            courseTag,
          });
        }
      }
    } catch (e: any) {
      console.warn(`Internet search failed for query "${query}":`, e?.message);
    }
  }

  // 3-2. 5대 코스 지식베이스에서 음성 묘사와 가장 부합하는 코스 정보 연계 강화
  const matched5CourseItems = HALLASAN_5_COURSES_KNOWLEDGE.filter((k) => {
    return k.keywords.some((kw) => text.includes(kw) || queries.some((q) => q.includes(kw)));
  });

  // 검색 결과에 5개 코스 공식 지식 보강 (최소 2~3개 코스 정보 보장)
  const supplementalKnowledge = (matched5CourseItems.length > 0 ? matched5CourseItems : HALLASAN_5_COURSES_KNOWLEDGE).slice(0, 3);
  for (const item of supplementalKnowledge) {
    if (!allResults.some((r) => r.title.includes(item.course))) {
      allResults.push({
        query: `한라산 ${item.course} 코스 (입구~정상)`,
        title: `[${item.course} 코스] ${item.courseSection}`,
        snippet: item.facilityDescription,
        url: item.url,
        courseTag: item.course,
      });
    }
  }

  return allResults.slice(0, 5);
}
