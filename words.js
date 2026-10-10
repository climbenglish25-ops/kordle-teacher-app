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
  { word: "산화",  definition: "물질이 산소와 결합하여 새로운 물질이 되는 화학 변화" },
  { word: "연소",  definition: "물질이 산소와 빠르게 결합하며 열과 빛을 내는 현상" },
  { word: "증발",  definition: "액체 표면에서 기체로 변하는 현상" },
  { word: "응결",  definition: "기체 상태의 수증기가 냉각되어 액체로 변하는 현상" },

  // 과학 — 빛
  { word: "굴절",  definition: "빛이 한 매질에서 다른 매질로 이동할 때 꺾이는 현상" },
  { word: "분산",  definition: "빛이 여러 색으로 나뉘어지는 현상 (예: 프리즘, 무지개)" },

  // 과학 — 인체
  { word: "소화",  definition: "음식물을 몸에 흡수할 수 있는 크기로 분해하는 과정" },
  { word: "순환",  definition: "피가 심장 → 온몸 → 심장으로 계속 돌아다니는 과정" },
  { word: "호흡",  definition: "산소를 들이마시고 이산화탄소를 내보내는 생명 활동" },
  { word: "배설",  definition: "몸속의 노폐물을 오줌, 땀 등으로 밖으로 내보내는 작용" },
  { word: "감각",  definition: "눈·코·귀·피부 등의 감각 기관이 자극을 받아들이는 일" },
  { word: "골격",  definition: "몸을 지탱하고 내장 기관을 보호하는 뼈의 전체 구조" },
  { word: "신경",  definition: "뇌와 척수에서 온몸으로 뻗어 자극과 반응을 전달하는 기관" },

  // 과학 — 지구·날씨·생태
  { word: "물질",  definition: "공간을 차지하고 질량을 가지는 모든 실체" },

  // 사회 — 정치·법·인권
  { word: "법원",  definition: "재판을 통해 법을 해석하고 갈등을 해결하는 사법 기관" },
  { word: "권리",  definition: "법이나 도덕이 인정하는 정당한 이익이나 힘" },
  { word: "의무",  definition: "국민으로서 반드시 해야 하는 법적·도덕적 책임" },
  { word: "조약",  definition: "국가 간에 합의하여 문서로 체결하는 공식적인 약속" },
  { word: "외교",  definition: "국가 간 평화로운 관계를 맺고 국익을 지키기 위한 활동" },
  { word: "재판",  definition: "법원에서 법을 적용해 옳고 그름을 가리는 공식 절차" },

  // 사회 — 지리·영토
  { word: "영토",  definition: "한 나라의 주권이 미치는 땅의 범위" },
  { word: "영해",  definition: "한 나라의 주권이 미치는 바다의 범위" },
  { word: "영공",  definition: "영토와 영해 위에 있는 하늘의 범위" },
  { word: "국토",  definition: "한 나라의 영토와 그 안에 있는 모든 땅과 자원" },
  { word: "방위",  definition: "동·서·남·북 등 방향을 나타내는 기준" },
  { word: "축척",  definition: "지도에서 실제 거리를 줄인 비율" },
  { word: "인구",  definition: "일정 지역에 살고 있는 사람의 총수" },

  // 국어·학습 — 핵심 문해력 어휘
  { word: "토론",  definition: "찬반 입장으로 나뉘어 논리적으로 상대를 설득하는 대화" },
  { word: "원인",  definition: "어떤 현상이나 결과를 일으키는 근본 이유" },
  { word: "탐구",  definition: "사물의 본질이나 진리를 깊이 파고들어 연구하는 일" },
  { word: "시설",  definition: "특정 활동을 위해 갖추어 놓은 건물이나 장치, 설비" },

  // ============================================================
  // 아래부터 추가 — 초등 5~6학년 교과서(과학·사회·수학·국어·실과 등) 수준
  // ============================================================

  // 과학 — 힘과 전기 (초등 6학년 "전기의 이용" 등)
  { word: "회로",  definition: "전류가 흐르도록 연결해 놓은 통로" },
  { word: "전구",  definition: "전기를 이용해 빛을 내는 기구" },
  { word: "무게",  definition: "물체의 무거운 정도" },
  { word: "진동",  definition: "물체가 떨려 흔들리는 현상" },

  // 과학 — 물질의 상태
  { word: "고체",  definition: "일정한 모양과 부피를 가진 물질의 상태" },
  { word: "액체",  definition: "담는 그릇에 따라 모양은 변하지만 부피는 일정한 물질의 상태" },
  { word: "기체",  definition: "일정한 모양이나 부피 없이 공간을 채우는 물질의 상태" },

  // 과학 — 지구와 우주 (초등 4~5학년 "화산과 지진", "태양계와 별" 등)
  { word: "화산",  definition: "땅속의 마그마가 분출하여 만들어진 지형" },
  { word: "마그마",  definition: "땅속 깊은 곳에서 암석이 녹아 있는 물질" },
  { word: "지진",  definition: "땅속 에너지가 갑자기 방출되어 땅이 흔들리는 현상" },
  { word: "침식",  definition: "물이나 바람이 지표를 깎아 내는 작용" },
  { word: "퇴적",  definition: "자갈, 모래, 진흙 등이 쌓이는 현상" },
  { word: "밀물",  definition: "바닷물이 육지 쪽으로 밀려 들어오는 현상" },
  { word: "썰물",  definition: "바닷물이 바다 쪽으로 빠져나가는 현상" },

  // 사회 — 경제 (초등 6학년 "우리나라의 경제 발전")
  { word: "생산",  definition: "사람이 필요한 물건이나 서비스를 만들어 내는 활동" },
  { word: "소비",  definition: "필요한 물건이나 서비스를 돈을 내고 사용하는 활동" },
  { word: "시장",  definition: "물건을 사고파는 일이 이루어지는 곳" },
  { word: "수요",  definition: "물건을 사려고 하는 사람들의 요구" },
  { word: "공급",  definition: "물건을 팔려고 시장에 내놓는 일" },
  { word: "무역",  definition: "나라와 나라 사이에 물건을 사고파는 일" },
  { word: "수출",  definition: "국내의 물건을 다른 나라에 파는 일" },
  { word: "수입",  definition: "다른 나라의 물건을 국내로 사들이는 일" },
  { word: "화폐",  definition: "물건을 사고팔 때 사용하는 돈" },
  { word: "저축",  definition: "소득 중 쓰지 않고 남겨 모아 두는 일" },
  { word: "투자",  definition: "이익을 얻을 목적으로 돈이나 시간을 들이는 일" },
  { word: "물가",  definition: "여러 물건과 서비스의 평균적인 가격 수준" },
  { word: "소득",  definition: "일을 하여 벌어들이는 돈" },
  { word: "세금",  definition: "국가나 지방자치단체가 국민에게 거두어들이는 돈" },
  { word: "환율",  definition: "서로 다른 나라 돈을 교환하는 비율" },

  // 사회 — 역사 (초등 5~6학년 한국사)
  { word: "유물",  definition: "옛사람들이 남긴 물건" },
  { word: "유적",  definition: "옛사람들이 남긴 건축물이나 자취가 남아 있는 곳" },
  { word: "왕조",  definition: "같은 왕가에서 왕위를 이어가며 다스리는 시대" },
  { word: "시대",  definition: "역사적으로 어떤 특징에 따라 구분되는 일정한 기간" },
  { word: "문명",  definition: "인류가 이룩한 정신적, 물질적 발전을 통틀어 이르는 말" },
  { word: "철기",  definition: "쇠로 만든 도구를 사용하던 시대의 유물" },
  { word: "개혁",  definition: "제도나 방법을 새롭게 뜯어고치는 일" },
  { word: "혁명",  definition: "이전의 제도나 방식을 근본적으로 뒤바꾸는 큰 변화" },
  { word: "독립",  definition: "다른 나라의 지배를 받지 않고 스스로 서는 일" },
  { word: "광복",  definition: "빼앗긴 나라의 주권을 되찾는 일" },

  // 사회 — 지리 (초등 5학년 "국토와 우리 생활" 등)
  { word: "대륙",  definition: "지구 표면에서 바다로 둘러싸인 커다란 육지" },
  { word: "해양",  definition: "지구 표면의 넓고 큰 바다" },
  { word: "반도",  definition: "삼면이 바다로 둘러싸이고 한 면은 육지에 이어진 땅" },
  { word: "산맥",  definition: "여러 산이 길게 이어져 있는 지형" },
  { word: "평야",  definition: "넓고 평평하게 펼쳐진 땅" },
  { word: "고원",  definition: "높은 지대에 있는 넓고 평평한 땅" },
  { word: "분지",  definition: "산이나 언덕으로 둘러싸인 평평한 땅" },
  { word: "하천",  definition: "강과 시내를 아울러 이르는 말" },
  { word: "사막",  definition: "비가 적게 내려 식물이 거의 자라지 않는 메마른 땅" },
  { word: "초원",  definition: "풀이 넓게 자라 있는 들판" },
  { word: "도시",  definition: "사람과 산업이 밀집해 있는 지역" },
  { word: "농촌",  definition: "농업을 중심으로 이루어진 마을이나 지역" },

  // 국어 (초등 5~6학년 문장 성분·표현법·글의 짜임)
  { word: "주어",  definition: "문장에서 동작이나 상태의 주체가 되는 말" },
  { word: "서술어",  definition: "문장에서 주어의 동작이나 상태를 풀이하는 말" },
  { word: "문장",  definition: "생각이나 감정을 완결된 형태로 나타낸 최소 단위" },
  { word: "문단",  definition: "하나의 중심 생각을 나타내는 문장들의 묶음" },
  { word: "어휘",  definition: "일정한 범위 안에서 사용되는 단어의 전체" },
  { word: "맥락",  definition: "앞뒤가 서로 이어지는 관계나 흐름" },
  { word: "비유",  definition: "어떤 대상을 다른 대상에 빗대어 표현하는 방법" },
  { word: "은유",  definition: "원관념을 숨기고 보조 관념만으로 표현하는 비유법" },
  { word: "직유",  definition: "'처럼', '같이' 등을 써서 두 대상을 직접 비교하는 비유법" },
  { word: "상징",  definition: "추상적인 뜻을 구체적인 사물로 나타내는 표현법" },
  { word: "운율",  definition: "시에서 느껴지는 말의 가락과 리듬" },
  { word: "인물",  definition: "이야기 속에서 어떤 역할을 맡아 행동하는 사람" },
  { word: "배경",  definition: "이야기가 펼쳐지는 시간과 공간" },
  { word: "주제",  definition: "글쓴이가 나타내고자 하는 중심 생각" },
  { word: "근거",  definition: "주장을 뒷받침하는 까닭이나 이유" },
  { word: "서론",  definition: "글의 처음 부분으로 화제를 소개하는 부분" },
  { word: "본론",  definition: "글의 중심이 되는 내용을 자세히 설명하는 부분" },
  { word: "결론",  definition: "글을 마무리하며 중심 생각을 정리하는 부분" },

  // 생활·건강
  { word: "재난",  definition: "뜻하지 않게 일어난 불행한 사고나 큰 피해" },
  { word: "예방",  definition: "병이나 사고가 생기기 전에 미리 막는 일" },
  { word: "위생",  definition: "건강을 지키고 병을 예방하기 위해 청결을 유지하는 일" },
  { word: "백신",  definition: "전염병을 예방하기 위해 몸에 넣는 약제" },
  { word: "면역",  definition: "몸속에 들어온 병균에 저항하는 힘" },

  // ============================================================
  // 추가 2차 — 365개를 위한 초등 5~6학년 수준 보충 어휘
  // ============================================================

  // 과학 — 우리 몸 확장
  { word: "심장",  definition: "온몸으로 피를 보내는 순환 기관" },
  { word: "대장",  definition: "소화되고 남은 찌꺼기에서 수분을 흡수하는 소화 기관" },
  { word: "소장",  definition: "위에서 내려온 음식물을 잘게 분해하여 흡수하는 소화 기관" },
  { word: "콩팥",  definition: "몸속의 노폐물을 걸러 오줌을 만드는 배설 기관" },
  { word: "혈관",  definition: "피가 흐르는 관" },
  { word: "혈액",  definition: "산소와 영양분을 온몸으로 나르는 붉은 액체" },
  { word: "체온",  definition: "몸의 온도" },

  // 과학 — 날씨와 재해
  { word: "태풍",  definition: "강한 바람과 많은 비를 몰고 오는 열대 저기압" },
  { word: "장마",  definition: "여름철에 여러 날 계속해서 비가 내리는 현상" },
  { word: "폭염",  definition: "매우 심한 더위" },
  { word: "한파",  definition: "갑자기 기온이 크게 떨어지는 심한 추위" },

  // 안전
  { word: "대피",  definition: "위험을 피해 안전한 곳으로 자리를 옮기는 것" },

  // 사회 — 정치
  { word: "국민",  definition: "한 나라를 이루는 사람들" },
  { word: "대표",  definition: "어떤 집단이나 나라를 책임지고 나타내는 사람" },

  // 사회 — 지리
  { word: "해안",  definition: "바다와 육지가 맞닿은 부분" },
  { word: "갯벌",  definition: "밀물과 썰물의 차이로 드러났다 잠겼다 하는 넓은 진흙 땅" },

  // 생활
  { word: "균형",  definition: "어느 한쪽으로 기울지 않고 고른 상태" },

  // ============================================================
  // 추가 3차 — 공고문·신청서 등 생활 문해력 단어
  // ============================================================

  // 신청·접수·서류
  { word: "신청",  definition: "무엇을 해 달라고 정식으로 요청하는 것" },
  { word: "접수",  definition: "신청서나 서류를 받는 것" },
  { word: "기간",  definition: "정해진 시작부터 끝까지의 동안" },
  { word: "기한",  definition: "정해진 시간까지의 한계" },
  { word: "마감",  definition: "정해진 기간이나 시간을 끝맺는 것" },
  { word: "대상",  definition: "어떤 일이나 행동이 미치는 상대" },
  { word: "자격",  definition: "어떤 일을 하는 데 필요한 조건이나 능력" },
  { word: "서류",  definition: "글이나 그림 등으로 내용을 적은 문서" },
  { word: "발급",  definition: "증명서나 서류 등을 만들어 내주는 것" },
  { word: "제출",  definition: "서류나 물건 등을 내는 것" },
  { word: "등록",  definition: "이름이나 정보를 문서나 대장에 올리는 것" },
  { word: "가입",  definition: "조직이나 단체에 들어가는 것" },
  { word: "동의",  definition: "다른 사람의 의견에 뜻을 같이 하는 것" },
  { word: "서명",  definition: "자기 이름을 써넣는 것" },

  // 공고·안내
  { word: "공지",  definition: "여러 사람에게 널리 알리는 것" },
  { word: "공고",  definition: "국가나 단체가 일반에게 널리 알리는 글" },
  { word: "문의",  definition: "모르거나 궁금한 것을 물어보는 것" },
  { word: "주최",  definition: "행사 등을 계획하여 여는 것" },
  { word: "규정",  definition: "정해 놓은 규칙" },
  { word: "민원",  definition: "국민이 행정 기관에 원하는 바를 요청하는 일" },
  { word: "신고",  definition: "어떤 사실을 관계 기관에 알리는 것" },

  // 소비 생활
  { word: "배송",  definition: "물건을 여러 곳에 나누어 보내는 것" },
  { word: "대여",  definition: "물건을 빌려주거나 빌리는 것" },
  { word: "반납",  definition: "빌린 것을 돌려주는 것" },
  { word: "분실",  definition: "물건을 잃어버리는 것" },

  // 학교·생활 안내
  { word: "지참",  definition: "무엇을 가지고 참여하는 것" },
  { word: "참석",  definition: "모임이나 행사에 자리를 함께하는 것" },
  { word: "결석",  definition: "나가야 할 자리에 나가지 않는 것" },
  { word: "견학",  definition: "실제로 보고 배우기 위해 어떤 곳을 찾아가는 것" },
  { word: "응시",  definition: "시험을 치르는 것" },
  { word: "심사",  definition: "자세히 조사하여 등급이나 합격 여부를 가리는 것" },

  // 공공기관·행정 용어
  { word: "출국",  definition: "나라 밖으로 나가는 것" },
  { word: "세관",  definition: "나라를 드나드는 물건을 검사하고 관리하는 기관" },
  { word: "검역",  definition: "전염병 등을 막기 위해 사람이나 물건을 검사하는 일" },
  { word: "환승",  definition: "다른 교통편으로 갈아타는 것" },
  { word: "환전",  definition: "자기 나라 돈을 다른 나라 돈으로 바꾸는 일" },
  { word: "전입",  definition: "다른 지역에서 이사하여 들어오는 것" },
  { word: "전출",  definition: "살던 곳에서 다른 지역으로 이사하여 나가는 것" },
  { word: "열람",  definition: "문서나 책 등을 훑어보는 것" },
  { word: "납부",  definition: "세금이나 요금 등을 내는 것" },
  { word: "감면",  definition: "세금이나 요금을 줄이거나 면제해 주는 것" },
  { word: "환급",  definition: "더 냈거나 잘못 낸 돈을 돌려받는 것" },
  { word: "체납",  definition: "세금이나 요금을 정한 기한까지 내지 않는 것" },
  { word: "과세",  definition: "세금을 매기는 것" },
  { word: "허가",  definition: "어떤 일을 하도록 공식적으로 승인하는 것" },

  // 국어 — 심화 어휘
  { word: "대응",  definition: "어떤 상황이나 문제에 알맞게 대처하는 일" },
  { word: "대면",  definition: "서로 얼굴을 마주 보고 상대하는 것" },
  { word: "대조",  definition: "둘 이상의 것을 서로 비교하여 차이를 밝히는 것" },
  { word: "지양",  definition: "더 나은 방향을 위해 어떤 일이나 생각을 하지 않도록 피하는 것" },
  { word: "지향",  definition: "어떤 목표나 방향으로 나아가려 하는 것" },
  { word: "보도",  definition: "신문이나 방송으로 사람들에게 사실이나 소식을 알리는 일" },
  { word: "저하",  definition: "능력이나 수준, 기능 등이 떨어지는 것" },
  { word: "증가",  definition: "수나 양이 이전보다 늘어나는 것" },
  { word: "실질",  definition: "겉으로 꾸민 모습이 아닌 실제 그대로의 내용이나 성질" },
  { word: "채무",  definition: "다른 사람에게 갚아야 할 돈이나 의무" },
  { word: "연민",  definition: "남의 불행이나 처지를 가엾고 안타깝게 여기는 마음" },
  { word: "사유",  definition: "어떤 일이 일어나게 된 까닭이나 이유" },
  { word: "여운",  definition: "어떤 일이 끝난 뒤에도 마음에 남아 있는 느낌이나 분위기" }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { decomposeChar, getJamoList, getChoseong, WORD_DATABASE };
}
