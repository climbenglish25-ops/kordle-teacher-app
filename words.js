// 한글 자모 분해 및 교과서 단어 데이터베이스 v2.0
// 동사/형용사 제거, 순수 명사만 포함

const CHO  = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
const JONG  = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

const DECOMPOSE_MAP = {
  'ㄲ':['ㄱ','ㄱ'], 'ㄸ':['ㄷ','ㄷ'], 'ㅃ':['ㅂ','ㅂ'], 'ㅆ':['ㅅ','ㅅ'], 'ㅉ':['ㅈ','ㅈ'],
  'ㅐ':['ㅏ','ㅣ'], 'ㅔ':['ㅓ','ㅣ'], 'ㅒ':['ㅑ','ㅣ'], 'ㅖ':['ㅕ','ㅣ'],
  'ㅘ':['ㅗ','ㅏ'], 'ㅙ':['ㅗ','ㅏ','ㅣ'], 'ㅚ':['ㅗ','ㅣ'],
  'ㅝ':['ㅜ','ㅓ'], 'ㅞ':['ㅜ','ㅓ','ㅣ'], 'ㅟ':['ㅜ','ㅣ'], 'ㅢ':['ㅡ','ㅣ'],
  'ㄳ':['ㄱ','ㅅ'], 'ㄵ':['ㄴ','ㅈ'], 'ㄶ':['ㄴ','ㅎ'],
  'ㄺ':['ㄹ','ㄱ'], 'ㄻ':['ㄹ','ㅁ'], 'ㄼ':['ㄹ','ㅂ'], 'ㄽ':['ㄹ','ㅅ'],
  'ㄾ':['ㄹ','ㅌ'], 'ㄿ':['ㄹ','ㅍ'], 'ㅀ':['ㄹ','ㅎ'], 'ㅄ':['ㅂ','ㅅ']
};

function decomposeChar(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return [char];
  const jongIdx = code % 28;
  const jungIdx = ((code - jongIdx) / 28) % 21;
  const choIdx  = Math.floor(((code - jongIdx) / 28) / 21);
  const res = [];
  const cho  = CHO[choIdx];
  const jung = JUNG[jungIdx];
  if (DECOMPOSE_MAP[cho])  res.push(...DECOMPOSE_MAP[cho]);  else res.push(cho);
  if (DECOMPOSE_MAP[jung]) res.push(...DECOMPOSE_MAP[jung]); else res.push(jung);
  if (jongIdx > 0) {
    const jong = JONG[jongIdx];
    if (DECOMPOSE_MAP[jong]) res.push(...DECOMPOSE_MAP[jong]); else res.push(jong);
  }
  return res;
}

function getJamoList(word) {
  let list = [];
  for (let i = 0; i < word.length; i++) list.push(...decomposeChar(word[i]));
  return list;
}

function getChoseong(word) {
  let result = '';
  for (let i = 0; i < word.length; i++) {
    const code = word.charCodeAt(i) - 0xAC00;
    if (code >= 0 && code <= 11171) {
      const jongIdx = code % 28;
      const jungIdx = ((code - jongIdx) / 28) % 21;
      const choIdx  = Math.floor(((code - jongIdx) / 28) / 21);
      result += CHO[choIdx];
    } else result += word[i];
  }
  return result;
}

// ============================================================
// 교과서 단어 데이터베이스 — 순수 명사만 포함 (동사/형용사 제거)
// ============================================================
const WORD_DATABASE = [
  // 과학 — 물질과 변화
  { word: "용해",  definition: "한 물질이 다른 물질에 녹아 골고루 섞이는 현상" },
  { word: "용액",  definition: "두 가지 이상의 물질이 균일하게 섞여 있는 액체 혼합물" },
  { word: "용매",  definition: "다른 물질을 녹이는 물질 (예: 소금물에서 '물')" },
  { word: "용질",  definition: "녹아 들어가는 물질 (예: 소금물에서 '소금')" },
  { word: "포화",  definition: "용질이 더 이상 녹지 않는 최대 한계에 이른 상태" },
  { word: "혼합물", definition: "두 가지 이상의 순물질이 섞여 있는 물질" },
  { word: "산화",  definition: "물질이 산소와 결합하여 새로운 물질이 되는 화학 변화" },
  { word: "연소",  definition: "물질이 산소와 빠르게 결합하며 열과 빛을 내는 현상" },
  { word: "증발",  definition: "액체 표면에서 기체로 변하는 현상" },
  { word: "응결",  definition: "기체 상태의 수증기가 냉각되어 액체로 변하는 현상" },

  // 과학 — 빛
  { word: "굴절",  definition: "빛이 한 매질에서 다른 매질로 이동할 때 꺾이는 현상" },
  { word: "반사",  definition: "빛이 물체 표면에 부딪혀 방향을 바꾸어 되돌아오는 현상" },
  { word: "거울",  definition: "빛의 반사를 이용해 물체의 모습을 비추어 보는 도구" },
  { word: "렌즈",  definition: "빛을 굴절시켜 상을 모으거나 퍼뜨리는 유리나 플라스틱 도구" },
  { word: "분산",  definition: "빛이 여러 색으로 나뉘어지는 현상 (예: 프리즘, 무지개)" },
  { word: "투명",  definition: "빛이 통과할 수 있어 물체의 반대편이 보이는 성질" },

  // 과학 — 인체
  { word: "소화",  definition: "음식물을 몸에 흡수할 수 있는 크기로 분해하는 과정" },
  { word: "순환",  definition: "피가 심장 → 온몸 → 심장으로 계속 돌아다니는 과정" },
  { word: "호흡",  definition: "산소를 들이마시고 이산화탄소를 내보내는 생명 활동" },
  { word: "배설",  definition: "몸속의 노폐물을 오줌, 땀 등으로 밖으로 내보내는 작용" },
  { word: "감각",  definition: "눈·코·귀·피부 등의 감각 기관이 자극을 받아들이는 일" },
  { word: "근육",  definition: "수축과 이완으로 뼈를 움직이게 하는 신체 조직" },
  { word: "골격",  definition: "몸을 지탱하고 내장 기관을 보호하는 뼈의 전체 구조" },
  { word: "신경",  definition: "뇌와 척수에서 온몸으로 뻗어 자극과 반응을 전달하는 기관" },
  { word: "영양소", definition: "몸에 필요한 에너지와 성분을 공급하는 음식 속 물질" },

  // 과학 — 지구·날씨·생태
  { word: "세균",  definition: "매우 작아 현미경으로만 볼 수 있는 단세포 미생물" },
  { word: "온도",  definition: "물질의 따뜻하거나 차가운 정도를 숫자로 나타낸 것" },
  { word: "습도",  definition: "공기 중에 포함된 수증기의 정도" },
  { word: "기온",  definition: "지상 약 1.5m 높이에서 측정한 대기의 온도" },
  { word: "기압",  definition: "공기의 무게로 인해 단위 면적에 가해지는 압력" },
  { word: "대기",  definition: "지구를 둘러싼 공기의 층" },
  { word: "기후",  definition: "오랜 기간에 걸쳐 한 지역에 나타나는 평균적인 날씨" },
  { word: "물질",  definition: "공간을 차지하고 질량을 가지는 모든 실체" },
  { word: "에너지", definition: "일을 할 수 있는 능력으로 열, 빛, 전기 등 여러 형태가 있음" },
  { word: "생물",  definition: "생명 현상을 가지고 살아가며 번식하는 모든 것" },
  { word: "생태계", definition: "생물과 주변 환경이 서로 영향을 주고받는 하나의 체계" },
  { word: "환경",  definition: "생물을 둘러싸고 영향을 미치는 모든 자연·사회적 조건" },
  { word: "지층",  definition: "오랜 시간 쌓인 자갈·모래·진흙 등의 층" },
  { word: "화석",  definition: "옛날 생물의 뼈나 흔적이 암석 속에 보존된 것" },

  // 사회 — 정치·법·인권
  { word: "인권",  definition: "사람이 태어날 때부터 가지는 인간답게 살 권리" },
  { word: "헌법",  definition: "국가의 기본 원칙을 담은 최상위 법" },
  { word: "국회",  definition: "국민 대표들이 모여 법을 만드는 입법 기관" },
  { word: "정부",  definition: "법을 집행하고 나라 살림을 맡아 행정을 담당하는 국가 기관" },
  { word: "법원",  definition: "재판을 통해 법을 해석하고 갈등을 해결하는 사법 기관" },
  { word: "주권",  definition: "국가의 의사를 최종적으로 결정할 수 있는 최고 권력" },
  { word: "권리",  definition: "법이나 도덕이 인정하는 정당한 이익이나 힘" },
  { word: "의무",  definition: "국민으로서 반드시 해야 하는 법적·도덕적 책임" },
  { word: "자유",  definition: "외부의 구속이나 간섭 없이 스스로 결정하고 행동할 수 있는 상태" },
  { word: "평등",  definition: "권리·의무·자격 등에서 차별 없이 동등하게 대우받는 일" },
  { word: "법률",  definition: "국회에서 제정하여 국가가 강제하는 사회 규범" },
  { word: "선거",  definition: "투표로 대표자나 지도자를 뽑는 민주주의의 핵심 과정" },
  { word: "민주",  definition: "국민이 주권을 가지고 스스로 나라를 다스리는 정치 체제" },
  { word: "시민",  definition: "국가나 사회의 구성원으로서 권리와 의무를 가진 사람" },
  { word: "조약",  definition: "국가 간에 합의하여 문서로 체결하는 공식적인 약속" },
  { word: "외교",  definition: "국가 간 평화로운 관계를 맺고 국익을 지키기 위한 활동" },
  { word: "재판",  definition: "법원에서 법을 적용해 옳고 그름을 가리는 공식 절차" },
  { word: "갈등",  definition: "개인이나 집단 사이에서 이해관계나 목표가 달라 생기는 대립" },
  { word: "행정",  definition: "정부가 법에 따라 나랏일을 처리하는 모든 활동" },

  // 사회 — 지리·영토
  { word: "영토",  definition: "한 나라의 주권이 미치는 땅의 범위" },
  { word: "영해",  definition: "한 나라의 주권이 미치는 바다의 범위" },
  { word: "영공",  definition: "영토와 영해 위에 있는 하늘의 범위" },
  { word: "독도",  definition: "우리나라 동쪽 끝 동해에 있는 섬으로 대한민국 고유 영토" },
  { word: "국토",  definition: "한 나라의 영토와 그 안에 있는 모든 땅과 자원" },
  { word: "지형",  definition: "땅의 높낮이·모양 등 지구 표면의 물리적 형태" },
  { word: "지도",  definition: "지구 표면을 일정한 비율로 줄여 평면에 나타낸 그림" },
  { word: "방위",  definition: "동·서·남·북 등 방향을 나타내는 기준" },
  { word: "축척",  definition: "지도에서 실제 거리를 줄인 비율" },
  { word: "등고선", definition: "지도에서 높이가 같은 지점을 이어 그린 선" },
  { word: "인구",  definition: "일정 지역에 살고 있는 사람의 총수" },
  { word: "지방",  definition: "수도권 이외의 지역, 또는 지역 단위의 행정 구역" },

  // 사회 — 경제·사회
  { word: "수송",  definition: "사람이나 물건을 한 곳에서 다른 곳으로 실어 나르는 일" },
  { word: "교통",  definition: "사람·화물이 이동하는 모든 수단과 체계" },
  { word: "소통",  definition: "생각·뜻·정보가 막힘 없이 서로 오고 가는 상태" },

  // 국어·학습 — 핵심 문해력 어휘
  { word: "문해력", definition: "글을 읽고 이해하여 일상과 학습에 활용하는 능력" },
  { word: "토의",  definition: "문제를 함께 의논하여 최선의 해결책을 찾는 과정" },
  { word: "토론",  definition: "찬반 입장으로 나뉘어 논리적으로 상대를 설득하는 대화" },
  { word: "회의",  definition: "여러 사람이 모여 의견을 나누고 결정을 내리는 모임" },
  { word: "의견",  definition: "어떤 사안에 대해 자신이 생각하는 판단이나 견해" },
  { word: "사실",  definition: "실제로 있었거나 존재하는 일, 거짓 없는 내용" },
  { word: "정보",  definition: "어떤 목적에 유용하게 쓰일 수 있도록 처리된 지식이나 자료" },
  { word: "과제",  definition: "해결해야 할 문제나 학습·연구를 위해 주어진 일" },
  { word: "자료",  definition: "연구나 학습의 근거가 되는 각종 데이터나 문헌" },
  { word: "이유",  definition: "어떤 일이나 행동의 원인이나 근거" },
  { word: "조건",  definition: "어떤 일이 이루어지기 위해 갖추어야 할 요소나 상황" },
  { word: "경험",  definition: "직접 해보거나 겪으면서 얻은 지식이나 느낌" },
  { word: "가치",  definition: "사물이나 일의 의의나 중요성, 쓸모의 정도" },
  { word: "태도",  definition: "어떤 일이나 상대를 대할 때의 마음가짐이나 행동 방식" },
  { word: "목표",  definition: "이루거나 도달하고자 하는 구체적인 지향점" },
  { word: "결과",  definition: "어떤 원인이나 과정이 가져온 최종 상태" },
  { word: "원인",  definition: "어떤 현상이나 결과를 일으키는 근본 이유" },
  { word: "탐구",  definition: "사물의 본질이나 진리를 깊이 파고들어 연구하는 일" },
  { word: "실험",  definition: "가설을 검증하기 위해 조건을 통제하고 관찰하는 과정" },
  { word: "발표",  definition: "여러 사람 앞에서 자신의 생각이나 조사 결과를 알리는 일" },
  { word: "정리",  definition: "어수선한 내용이나 물건을 체계적으로 모으고 갖추는 일" },
  { word: "안전",  definition: "위험이나 사고 없이 평안하고 온전한 상태" },
  { word: "생명",  definition: "살아 있는 것의 근원적인 힘, 또는 생물이 살아있는 상태" },
  { word: "교육",  definition: "지식·기능·태도를 가르치고 기르는 모든 활동" },
  { word: "시설",  definition: "특정 활동을 위해 갖추어 놓은 건물이나 장치, 설비" },
  { word: "개인",  definition: "사회나 집단을 이루는 낱낱의 사람" },
  { word: "사회",  definition: "사람들이 모여 관계를 맺고 함께 생활하는 집단" },

  // 디지털·과학기술
  { word: "디지털", definition: "연속적인 값을 0과 1의 숫자로 바꾸어 처리하는 방식" },
  { word: "컴퓨터", definition: "데이터를 빠르게 입력·처리·저장하는 전자 장치" },
  { word: "인터넷", definition: "전 세계의 컴퓨터가 하나로 연결된 거대한 통신망" },

  // 기타 핵심 명사
  { word: "대통령", definition: "공화국에서 국가를 대표하고 행정부를 이끄는 최고 지도자" },
  { word: "소화기", definition: "화재 발생 시 불을 끄는 데 쓰는 휴대용 소방 기구" },
  { word: "음식",   definition: "사람이 먹을 수 있도록 만들어진 모든 먹을거리" },
  { word: "건강",   definition: "몸과 마음이 탈 없이 튼튼한 상태" },
  { word: "지식",   definition: "배우고 경험하여 얻은 체계적인 정보와 이해" },
  { word: "학교",   definition: "일정한 목적과 교육 과정 아래 공부를 가르치는 기관" },
  { word: "국가",   definition: "일정한 영토와 국민을 기반으로 통치권을 가진 정치 공동체" },
  { word: "사용",   definition: "물건이나 방법 등을 일정한 목적에 맞게 쓰는 일" },
  { word: "해결",   definition: "얽힌 문제나 분쟁을 풀어서 해소하는 일" },
  { word: "공부",   definition: "학문이나 기술을 배우고 익히는 활동" },
  { word: "방법",   definition: "어떤 일을 해나가는 절차나 수단" },
  { word: "관리",   definition: "일이나 물건이 잘 되도록 처리하고 돌보는 활동" },
  { word: "기능",   definition: "어떤 역할을 수행하거나 작동하는 능력이나 작용" },
  { word: "과정",   definition: "목표에 도달하기 위해 거치는 단계나 절차의 흐름" },
  { word: "장치",   definition: "특정 기능을 수행하기 위해 만들어진 기계나 도구" },
  { word: "구조",   definition: "여러 부분이 전체를 이루기 위해 결합된 방식이나 얼개" },
  { word: "관계",   definition: "둘 이상의 사람·사물·현상이 서로 이어져 영향을 주는 상태" },
  { word: "기회",   definition: "어떤 일을 하기에 알맞은 때나 형편" },
  { word: "문화",   definition: "한 사회가 오랜 시간에 걸쳐 만들어 온 생활 방식의 총체" },
  { word: "역사",   definition: "인류가 지나온 과거의 사건과 그 기록" },
  { word: "전통",   definition: "한 집단이 오랫동안 이어받아 지켜온 관습이나 문화" }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { decomposeChar, getJamoList, getChoseong, WORD_DATABASE };
}
