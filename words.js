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
  { word: "전통",   definition: "한 집단이 오랫동안 이어받아 지켜온 관습이나 문화" },

  // ============================================================
  // 아래부터 추가 — 초등 5~6학년 교과서(과학·사회·수학·국어·실과 등) 수준
  // ============================================================

  // 과학 — 힘과 전기 (초등 6학년 "전기의 이용" 등)
  { word: "속도",   definition: "물체가 단위 시간 동안 이동한 거리로 나타낸 빠르기" },
  { word: "중력",   definition: "지구가 물체를 끌어당기는 힘" },
  { word: "전류",   definition: "전기가 흐르는 양" },
  { word: "회로",   definition: "전류가 흐르도록 연결해 놓은 통로" },
  { word: "발전기", definition: "운동 에너지를 전기 에너지로 바꾸는 장치" },
  { word: "자석",   definition: "쇠붙이를 끌어당기는 성질을 가진 물체" },
  { word: "전지",   definition: "전기 에너지를 저장해 두었다가 흘려보내는 장치" },
  { word: "전구",   definition: "전기를 이용해 빛을 내는 기구" },
  { word: "무게",   definition: "물체의 무거운 정도" },
  { word: "진동",   definition: "물체가 떨려 흔들리는 현상" },

  // 과학 — 물질의 상태
  { word: "고체",   definition: "일정한 모양과 부피를 가진 물질의 상태" },
  { word: "액체",   definition: "담는 그릇에 따라 모양은 변하지만 부피는 일정한 물질의 상태" },
  { word: "기체",   definition: "일정한 모양이나 부피 없이 공간을 채우는 물질의 상태" },

  // 과학 — 생물과 생태 (초등 5학년 "생물과 환경" 등)
  { word: "광합성", definition: "식물이 빛을 이용해 스스로 양분을 만드는 과정" },
  { word: "엽록소", definition: "식물의 잎에서 광합성을 하는 초록색 색소" },
  { word: "기관",   definition: "특정한 기능을 하는 몸속의 부분 (예: 소화 기관, 호흡 기관)" },
  { word: "서식지", definition: "생물이 살아가는 일정한 장소" },
  { word: "먹이사슬", definition: "생물들이 먹고 먹히는 관계로 이어진 사슬" },
  { word: "생산자", definition: "스스로 양분을 만들어 내는 생물" },
  { word: "소비자", definition: "다른 생물을 먹이로 삼아 양분을 얻는 생물" },
  { word: "분해자", definition: "죽은 생물이나 배설물을 분해하는 생물" },
  { word: "개체",   definition: "하나의 독립된 생명체" },
  { word: "군집",   definition: "여러 종류의 생물이 함께 모여 사는 무리" },
  { word: "멸종",   definition: "생물의 한 종류가 완전히 사라지는 일" },
  { word: "외래종", definition: "원래 살던 곳이 아닌 다른 지역에서 들어온 생물" },
  { word: "천적",   definition: "어떤 생물을 잡아먹는 다른 생물" },

  // 과학 — 지구와 우주 (초등 4~5학년 "화산과 지진", "태양계와 별" 등)
  { word: "화산",   definition: "땅속의 마그마가 분출하여 만들어진 지형" },
  { word: "마그마", definition: "땅속 깊은 곳에서 암석이 녹아 있는 물질" },
  { word: "지진",   definition: "땅속 에너지가 갑자기 방출되어 땅이 흔들리는 현상" },
  { word: "침식",   definition: "물이나 바람이 지표를 깎아 내는 작용" },
  { word: "퇴적",   definition: "자갈, 모래, 진흙 등이 쌓이는 현상" },
  { word: "태양계", definition: "태양과 그 주위를 도는 행성들로 이루어진 체계" },
  { word: "행성",   definition: "태양 주위를 도는 둥근 천체" },
  { word: "위성",   definition: "행성 주위를 도는 천체" },
  { word: "은하",   definition: "수많은 별들이 모여 이루어진 거대한 천체 집단" },
  { word: "혜성",   definition: "긴 꼬리를 끌며 태양 주위를 도는 천체" },
  { word: "일식",   definition: "달이 태양을 가려 태양이 보이지 않게 되는 현상" },
  { word: "월식",   definition: "지구의 그림자에 달이 가려지는 현상" },
  { word: "밀물",   definition: "바닷물이 육지 쪽으로 밀려 들어오는 현상" },
  { word: "썰물",   definition: "바닷물이 바다 쪽으로 빠져나가는 현상" },
  { word: "강수량", definition: "일정 기간 동안 내린 비나 눈의 양" },

  // 수학 (초등 5~6학년 "약수와 배수", "비와 비율", "여러 가지 그래프" 등)
  { word: "분수",   definition: "전체를 똑같이 나눈 것 중 몇 개인지 나타내는 수" },
  { word: "소수",   definition: "0보다 크고 1보다 작은 자리를 점으로 나타낸 수" },
  { word: "비율",   definition: "기준량에 대해 비교하는 양의 크기" },
  { word: "백분율", definition: "전체를 100으로 보았을 때의 비율" },
  { word: "평균",   definition: "여러 수를 더해 그 개수로 나눈 값" },
  { word: "도형",   definition: "점, 선, 면으로 이루어진 모양" },
  { word: "각도",   definition: "두 선이 만나 이루는 벌어진 정도" },
  { word: "넓이",   definition: "평면이 차지하는 공간의 크기" },
  { word: "부피",   definition: "물체가 차지하는 공간의 크기" },
  { word: "둘레",   definition: "도형의 테두리를 따라 잰 길이" },
  { word: "약수",   definition: "어떤 수를 나누어떨어지게 하는 수" },
  { word: "배수",   definition: "어떤 수를 몇 배 한 수" },

  // 사회 — 경제 (초등 6학년 "우리나라의 경제 발전")
  { word: "생산",   definition: "사람이 필요한 물건이나 서비스를 만들어 내는 활동" },
  { word: "소비",   definition: "필요한 물건이나 서비스를 돈을 내고 사용하는 활동" },
  { word: "시장",   definition: "물건을 사고파는 일이 이루어지는 곳" },
  { word: "수요",   definition: "물건을 사려고 하는 사람들의 요구" },
  { word: "공급",   definition: "물건을 팔려고 시장에 내놓는 일" },
  { word: "무역",   definition: "나라와 나라 사이에 물건을 사고파는 일" },
  { word: "수출",   definition: "국내의 물건을 다른 나라에 파는 일" },
  { word: "수입",   definition: "다른 나라의 물건을 국내로 사들이는 일" },
  { word: "화폐",   definition: "물건을 사고팔 때 사용하는 돈" },
  { word: "저축",   definition: "소득 중 쓰지 않고 남겨 모아 두는 일" },
  { word: "투자",   definition: "이익을 얻을 목적으로 돈이나 시간을 들이는 일" },
  { word: "물가",   definition: "여러 물건과 서비스의 평균적인 가격 수준" },
  { word: "소득",   definition: "일을 하여 벌어들이는 돈" },
  { word: "세금",   definition: "국가나 지방자치단체가 국민에게 거두어들이는 돈" },
  { word: "환율",   definition: "서로 다른 나라 돈을 교환하는 비율" },

  // 사회 — 역사 (초등 5~6학년 한국사)
  { word: "유물",   definition: "옛사람들이 남긴 물건" },
  { word: "유적",   definition: "옛사람들이 남긴 건축물이나 자취가 남아 있는 곳" },
  { word: "왕조",   definition: "같은 왕가에서 왕위를 이어가며 다스리는 시대" },
  { word: "시대",   definition: "역사적으로 어떤 특징에 따라 구분되는 일정한 기간" },
  { word: "문명",   definition: "인류가 이룩한 정신적, 물질적 발전을 통틀어 이르는 말" },
  { word: "청동기", definition: "구리와 주석을 섞어 만든 도구를 사용하던 시대의 유물" },
  { word: "철기",   definition: "쇠로 만든 도구를 사용하던 시대의 유물" },
  { word: "개혁",   definition: "제도나 방법을 새롭게 뜯어고치는 일" },
  { word: "혁명",   definition: "이전의 제도나 방식을 근본적으로 뒤바꾸는 큰 변화" },
  { word: "독립",   definition: "다른 나라의 지배를 받지 않고 스스로 서는 일" },
  { word: "광복",   definition: "빼앗긴 나라의 주권을 되찾는 일" },
  { word: "식민지", definition: "다른 나라의 지배를 받는 나라나 지역" },
  { word: "근대화", definition: "사회가 옛 방식에서 벗어나 새로운 방식으로 변화하는 것" },
  { word: "산업화", definition: "사회의 중심 산업이 농업에서 공업으로 바뀌는 과정" },

  // 사회 — 지리 (초등 5학년 "국토와 우리 생활" 등)
  { word: "대륙",   definition: "지구 표면에서 바다로 둘러싸인 커다란 육지" },
  { word: "해양",   definition: "지구 표면의 넓고 큰 바다" },
  { word: "반도",   definition: "삼면이 바다로 둘러싸이고 한 면은 육지에 이어진 땅" },
  { word: "산맥",   definition: "여러 산이 길게 이어져 있는 지형" },
  { word: "평야",   definition: "넓고 평평하게 펼쳐진 땅" },
  { word: "고원",   definition: "높은 지대에 있는 넓고 평평한 땅" },
  { word: "분지",   definition: "산이나 언덕으로 둘러싸인 평평한 땅" },
  { word: "하천",   definition: "강과 시내를 아울러 이르는 말" },
  { word: "사막",   definition: "비가 적게 내려 식물이 거의 자라지 않는 메마른 땅" },
  { word: "초원",   definition: "풀이 넓게 자라 있는 들판" },
  { word: "도시",   definition: "사람과 산업이 밀집해 있는 지역" },
  { word: "농촌",   definition: "농업을 중심으로 이루어진 마을이나 지역" },

  // 국어 (초등 5~6학년 문장 성분·표현법·글의 짜임)
  { word: "주어",   definition: "문장에서 동작이나 상태의 주체가 되는 말" },
  { word: "서술어", definition: "문장에서 주어의 동작이나 상태를 풀이하는 말" },
  { word: "목적어", definition: "문장에서 서술어의 동작 대상이 되는 말" },
  { word: "문장",   definition: "생각이나 감정을 완결된 형태로 나타낸 최소 단위" },
  { word: "문단",   definition: "하나의 중심 생각을 나타내는 문장들의 묶음" },
  { word: "어휘",   definition: "일정한 범위 안에서 사용되는 단어의 전체" },
  { word: "맥락",   definition: "앞뒤가 서로 이어지는 관계나 흐름" },
  { word: "비유",   definition: "어떤 대상을 다른 대상에 빗대어 표현하는 방법" },
  { word: "은유",   definition: "원관념을 숨기고 보조 관념만으로 표현하는 비유법" },
  { word: "직유",   definition: "'처럼', '같이' 등을 써서 두 대상을 직접 비교하는 비유법" },
  { word: "상징",   definition: "추상적인 뜻을 구체적인 사물로 나타내는 표현법" },
  { word: "운율",   definition: "시에서 느껴지는 말의 가락과 리듬" },
  { word: "인물",   definition: "이야기 속에서 어떤 역할을 맡아 행동하는 사람" },
  { word: "배경",   definition: "이야기가 펼쳐지는 시간과 공간" },
  { word: "주제",   definition: "글쓴이가 나타내고자 하는 중심 생각" },
  { word: "근거",   definition: "주장을 뒷받침하는 까닭이나 이유" },
  { word: "서론",   definition: "글의 처음 부분으로 화제를 소개하는 부분" },
  { word: "본론",   definition: "글의 중심이 되는 내용을 자세히 설명하는 부분" },
  { word: "결론",   definition: "글을 마무리하며 중심 생각을 정리하는 부분" },

  // 디지털·정보 (초등 실과 "소프트웨어와 생활" 등)
  { word: "알고리즘", definition: "문제를 해결하기 위한 절차나 방법을 순서대로 나열한 것" },
  { word: "하드웨어", definition: "컴퓨터를 이루는 눈에 보이는 기계 장치" },
  { word: "데이터", definition: "컴퓨터가 처리할 수 있는 형태로 된 자료" },
  { word: "인공지능", definition: "컴퓨터가 인간처럼 학습하고 판단하도록 만든 기술" },
  { word: "로봇",   definition: "사람이 할 일을 대신 수행하는 기계 장치" },
  { word: "센서",   definition: "빛, 소리, 온도 등을 감지하는 장치" },
  { word: "네트워크", definition: "여러 컴퓨터가 서로 연결되어 정보를 주고받는 통신망" },
  { word: "서버",   definition: "다른 컴퓨터에 정보나 서비스를 제공하는 컴퓨터" },
  { word: "해킹",   definition: "다른 사람의 컴퓨터에 몰래 침입하는 행위" },
  { word: "저작권", definition: "창작한 작품에 대해 만든 사람이 가지는 권리" },
  { word: "플랫폼", definition: "여러 서비스가 이루어지는 바탕이 되는 프로그램이나 공간" },

  // 인성·진로·사회생활 (도덕·실과)
  { word: "직업",   definition: "생계를 위해 일정 기간 계속하여 하는 일" },
  { word: "진로",   definition: "앞으로 나아갈 방향이나 길" },
  { word: "적성",   definition: "어떤 일에 알맞은 성질이나 능력" },
  { word: "흥미",   definition: "마음이 끌리어 관심을 갖는 감정" },
  { word: "역할",   definition: "맡아서 해야 할 일이나 구실" },
  { word: "책임",   definition: "맡아서 해야 할 임무나 의무" },
  { word: "협동",   definition: "서로 마음과 힘을 하나로 합하는 일" },
  { word: "배려",   definition: "다른 사람을 도와주거나 보살펴 주려는 마음" },
  { word: "존중",   definition: "남의 인격이나 생각을 높이어 귀중하게 대하는 것" },
  { word: "공감",   definition: "남의 생각이나 감정을 자기 것처럼 느끼는 것" },
  { word: "봉사",   definition: "대가 없이 남을 위해 힘을 쓰는 일" },

  // 예술·체육 (미술의 색 3요소, 체육의 체력 요소)
  { word: "리듬",   definition: "음악에서 소리의 길이와 강약이 반복되는 흐름" },
  { word: "박자",   definition: "음악에서 일정한 간격으로 되풀이되는 시간의 단위" },
  { word: "선율",   definition: "높낮이와 길이가 다른 음이 이어져 만들어진 가락" },
  { word: "명암",   definition: "그림에서 밝고 어두운 정도의 차이" },
  { word: "원근",   definition: "그림에서 멀고 가까운 거리감을 나타내는 방법" },
  { word: "구도",   definition: "그림에서 형태나 색을 배치하는 짜임새" },
  { word: "채도",   definition: "색의 맑고 탁한 정도" },
  { word: "지구력", definition: "오랫동안 힘든 일을 견디어 내는 능력" },
  { word: "순발력", definition: "짧은 시간에 강한 힘을 낼 수 있는 능력" },
  { word: "유연성", definition: "몸을 부드럽게 움직일 수 있는 능력" },

  // 환경
  { word: "오염",   definition: "물, 공기, 흙 등이 더럽혀지는 것" },
  { word: "온난화", definition: "지구의 평균 기온이 점점 높아지는 현상" },
  { word: "미세먼지", definition: "눈에 잘 보이지 않을 만큼 작은 먼지 입자" },
  { word: "재활용", definition: "쓰고 버린 물건을 다시 쓸 수 있게 만드는 일" },
  { word: "탄소",   definition: "생물체를 이루는 기본 원소이자 화석 연료의 주성분" },
  { word: "자원",   definition: "생활에 이용할 수 있는 물질이나 힘" },
  { word: "사막화", definition: "기후 변화나 환경 파괴로 땅이 사막처럼 변하는 현상" },

  // 생활·건강
  { word: "재난",   definition: "뜻하지 않게 일어난 불행한 사고나 큰 피해" },
  { word: "예방",   definition: "병이나 사고가 생기기 전에 미리 막는 일" },
  { word: "위생",   definition: "건강을 지키고 병을 예방하기 위해 청결을 유지하는 일" },
  { word: "전염병", definition: "병균이 다른 사람에게 옮아 퍼지는 병" },
  { word: "백신",   definition: "전염병을 예방하기 위해 몸에 넣는 약제" },
  { word: "면역",   definition: "몸속에 들어온 병균에 저항하는 힘" },

  // ============================================================
  // 추가 2차 — 365개를 위한 초등 5~6학년 수준 보충 어휘
  // ============================================================

  // 과학 — 우리 몸 확장
  { word: "심장",   definition: "온몸으로 피를 보내는 순환 기관" },
  { word: "대장",   definition: "소화되고 남은 찌꺼기에서 수분을 흡수하는 소화 기관" },
  { word: "소장",   definition: "위에서 내려온 음식물을 잘게 분해하여 흡수하는 소화 기관" },
  { word: "콩팥",   definition: "몸속의 노폐물을 걸러 오줌을 만드는 배설 기관" },
  { word: "혈관",   definition: "피가 흐르는 관" },
  { word: "혈액",   definition: "산소와 영양분을 온몸으로 나르는 붉은 액체" },
  { word: "체온",   definition: "몸의 온도" },

  // 과학 — 날씨와 재해
  { word: "태풍",   definition: "강한 바람과 많은 비를 몰고 오는 열대 저기압" },
  { word: "장마",   definition: "여름철에 여러 날 계속해서 비가 내리는 현상" },
  { word: "폭염",   definition: "매우 심한 더위" },
  { word: "한파",   definition: "갑자기 기온이 크게 떨어지는 심한 추위" },

  // 과학 — 빛
  { word: "그림자", definition: "물체가 빛을 가려서 생기는 어두운 부분" },

  // 과학 — 에너지와 환경
  { word: "태양광", definition: "태양에서 나오는 빛과 열 에너지" },
  { word: "풍력",   definition: "바람의 힘을 이용하여 얻는 에너지" },
  { word: "수력",   definition: "물의 힘을 이용하여 얻는 에너지" },
  { word: "기후변화", definition: "기후가 오랜 시간에 걸쳐 변화하는 현상" },
  { word: "대기오염", definition: "매연이나 배기가스 등으로 공기가 더러워지는 것" },
  { word: "수질오염", definition: "폐수나 생활 하수 등으로 물이 더러워지는 것" },

  // 과학 — 영양소
  { word: "탄수화물", definition: "몸을 움직이는 힘을 내는 데 주로 쓰이는 영양소" },
  { word: "단백질", definition: "몸을 이루고 자라게 하는 데 필요한 영양소" },
  { word: "비타민", definition: "몸의 기능을 조절하고 병을 막아 주는 영양소" },
  { word: "무기질", definition: "뼈와 이를 튼튼하게 하는 등 몸의 기능을 돕는 영양소" },

  // 안전
  { word: "대피",   definition: "위험을 피해 안전한 곳으로 자리를 옮기는 것" },

  // 수학 — 입체도형
  { word: "직육면체", definition: "여섯 개의 직사각형 면으로 둘러싸인 입체도형" },
  { word: "정육면체", definition: "여섯 개의 정사각형 면으로 둘러싸인 입체도형" },
  { word: "원기둥", definition: "위와 아래가 서로 합동인 원으로 이루어진 둥근 기둥 모양의 입체도형" },
  { word: "원뿔",   definition: "밑면이 원이고 옆면이 하나의 곡면으로 이루어진 뾰족한 입체도형" },
  { word: "각기둥", definition: "두 밑면이 서로 합동인 다각형으로 이루어진 기둥 모양의 입체도형" },
  { word: "각뿔",   definition: "밑면이 다각형이고 옆면이 삼각형인 뾰족한 입체도형" },

  // 수학 — 각과 도형
  { word: "대칭",   definition: "어떤 도형을 접거나 돌렸을 때 완전히 겹치는 성질" },
  { word: "둔각",   definition: "90도보다 크고 180도보다 작은 각" },
  { word: "예각",   definition: "90도보다 작은 각" },
  { word: "합동",   definition: "모양과 크기가 같아서 완전히 포개어지는 두 도형의 관계" },
  { word: "비례",   definition: "두 양이 같은 비율로 늘거나 주는 관계" },
  { word: "정삼각형", definition: "세 변의 길이가 모두 같은 삼각형" },

  // 수학 — 수와 연산 / 자료
  { word: "통분",   definition: "분모가 다른 분수들을 분모가 같은 분수로 만드는 것" },
  { word: "약분",   definition: "분모와 분자를 공약수로 나누어 간단히 하는 것" },
  { word: "그래프", definition: "여러 자료를 점, 선, 막대 등으로 보기 쉽게 나타낸 것" },

  // 사회 — 정치
  { word: "국민",   definition: "한 나라를 이루는 사람들" },
  { word: "대표",   definition: "어떤 집단이나 나라를 책임지고 나타내는 사람" },

  // 사회 — 지리
  { word: "해안",   definition: "바다와 육지가 맞닿은 부분" },
  { word: "갯벌",   definition: "밀물과 썰물의 차이로 드러났다 잠겼다 하는 넓은 진흙 땅" },
  { word: "인구밀도", definition: "일정한 지역의 넓이에 대한 인구수의 비율" },

  // 사회 — 세계와 문화
  { word: "다문화", definition: "여러 나라의 다양한 문화가 함께 어우러져 있는 것" },
  { word: "세계화", definition: "세계 여러 나라가 정치·경제·문화적으로 가까워지는 현상" },
  { word: "국제기구", definition: "여러 나라가 모여 만든 국제적인 조직" },
  { word: "난민",   definition: "전쟁이나 재해 등을 피해 다른 나라로 떠난 사람" },
  { word: "이주민", definition: "다른 지역이나 나라에서 옮겨와 사는 사람" },

  // 사회 — 인구
  { word: "저출산", definition: "태어나는 아이의 수가 점점 줄어드는 현상" },
  { word: "고령화", definition: "전체 인구 중 노인이 차지하는 비율이 높아지는 현상" },

  // 사회 — 산업
  { word: "농업",   definition: "땅을 이용하여 곡식이나 채소 등을 기르는 산업" },
  { word: "어업",   definition: "물고기나 조개 등을 잡거나 기르는 산업" },
  { word: "공업",   definition: "원료를 가공하여 물건을 만드는 산업" },

  // 사회 — 역사와 문화유산
  { word: "문화재", definition: "조상들이 남긴 문화적 가치가 있어 보호하는 것" },
  { word: "국보",   definition: "나라에서 지정해 보호하는 매우 귀중한 문화재" },
  { word: "장군",   definition: "군대를 지휘하는 우두머리" },
  { word: "실학",   definition: "조선 후기에 실생활에 도움이 되는 학문을 중시한 사상" },
  { word: "판소리", definition: "한 사람이 소리와 몸짓으로 이야기를 표현하는 우리나라 전통 음악" },
  { word: "한글",   definition: "세종대왕이 만든 우리나라 고유의 문자" },

  // 국어 — 어휘와 표현
  { word: "속담",   definition: "옛날부터 전해 내려오는 교훈이나 지혜가 담긴 짧은 말" },
  { word: "관용구", definition: "둘 이상의 낱말이 합쳐져 원래와 다른 새로운 뜻으로 굳어진 말" },
  { word: "높임말", definition: "웃어른이나 상대를 높이기 위해 사용하는 말" },
  { word: "표준어", definition: "한 나라에서 공용어로 정하여 쓰는 규범이 되는 말" },
  { word: "방언",   definition: "어떤 지역에서만 사용하는 특유의 말" },
  { word: "낱말",   definition: "뜻을 지닌 말의 최소 단위" },
  { word: "의성어", definition: "소리를 흉내 낸 말" },
  { word: "의태어", definition: "모양이나 움직임을 흉내 낸 말" },
  { word: "고유어", definition: "옛날부터 우리말에 본디 있던 말" },
  { word: "외래어", definition: "다른 나라 말이 들어와 우리말처럼 쓰이는 말" },

  // 국어 — 쓰기와 어문 규정
  { word: "제목",   definition: "글이나 책의 내용을 대표하여 붙이는 이름" },
  { word: "띄어쓰기", definition: "낱말과 낱말 사이를 띄어서 쓰는 규칙" },
  { word: "맞춤법", definition: "표준어를 정해진 규칙에 맞도록 적는 법" },

  // 디지털·미디어
  { word: "동영상", definition: "움직이는 화면과 소리로 이루어진 영상" },
  { word: "매체",   definition: "어떤 사실이나 정보를 다른 사람에게 전달하는 수단" },
  { word: "댓글",   definition: "인터넷 게시물 아래에 답으로 다는 짧은 글" },
  { word: "개인정보", definition: "특정한 개인을 알아볼 수 있는 이름, 주소 등의 정보" },

  // 예술
  { word: "장단",   definition: "국악에서 음악의 빠르기와 박자를 나타내는 것" },
  { word: "국악",   definition: "우리나라 고유의 전통 음악" },
  { word: "조각",   definition: "나무, 돌, 흙 등을 깎거나 빚어서 입체적으로 만든 작품" },
  { word: "판화",   definition: "나무판이나 고무판 등에 새긴 그림을 찍어 내는 기법" },

  // 체육
  { word: "근력",   definition: "근육이 힘을 내는 능력" },
  { word: "평형성", definition: "몸의 균형을 유지하는 능력" },

  // 생활
  { word: "균형",   definition: "어느 한쪽으로 기울지 않고 고른 상태" }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { decomposeChar, getJamoList, getChoseong, WORD_DATABASE };
}
