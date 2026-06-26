// 교과서 꼬들 — 게임 엔진 v2.0
// ============================================================

// ── 상수 ──────────────────────────────────────────────────
const KST_OFFSET         = 9 * 60 * 60 * 1000;   // UTC+9
const KEY_STATE_PREFIX   = 'kordle-state-';       // + YYYY-MM-DD
const KEY_STATS          = 'kordle-stats';
const KEY_THEME          = 'kordle-theme';
const MAX_ROWS           = 6;

// ── Supabase 설정 ─────────────────────────────────────────
const supabaseUrl = 'https://wnkdpuhurluanjljqprg.supabase.co';
const supabaseKey = 'sb_publishable_wRe2mhCzYpzV0kk5hUWhXw_Jpsx4TIS';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let DB_WORDS = [];
let DB_SETTINGS = { teacher_pass: '문해력', daily_word_data: {} };

async function loadSupabaseData() {
  try {
    const { data: wData } = await supabaseClient.from('words_list').select('*').order('created_at', { ascending: true });
    if (wData && wData.length > 0) DB_WORDS = wData;
    else DB_WORDS = [...WORD_DATABASE];
    
    const { data: sData } = await supabaseClient.from('app_settings').select('*').eq('id', 1).single();
    if (sData) {
      if (!sData.daily_word_data) sData.daily_word_data = {};
      DB_SETTINGS = sData;
    }
  } catch(e) {
    console.error("Supabase load error:", e);
    DB_WORDS = [...WORD_DATABASE];
  }
}

// ── 게임 상태 ────────────────────────────────────────────
let solution      = null;   // { word, definition }
let solutionJamos = [];
let cols          = 6;
let currentRow    = 0;
let currentCol    = 0;
let guesses       = [];     // maxRows × cols 2D array
let tileStatesLog = [];     // [rowIndex][colIndex] → 'correct'|'present'|'absent'
let isGameOver    = false;
let hintsUsed     = 0;

let stats = { played:0, won:0, currentStreak:0, maxStreak:0, distribution:[0,0,0,0,0,0] };

// ============================================================
// 초기화
// ============================================================
window.addEventListener('DOMContentLoaded', async () => {
  await loadSupabaseData();
  loadStats();
  applyTheme(getPreferredTheme());
  initGame();
  setupEventListeners();
});

// ============================================================
// KST 날짜 유틸
// ============================================================
function getKSTDateString() {
  const kst = new Date(Date.now() + KST_OFFSET);
  return kst.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// ============================================================
// 단어 선택 (날짜 기반 결정론적 + 교사 오버라이드)
// ============================================================
function getActiveWordList() {
  return DB_WORDS.length > 0 ? DB_WORDS : WORD_DATABASE;
}

function getDailyWord() {
  // 1) URL 파라미터 커스텀 단어 (선생님이 링크로 공유)
  const params = new URLSearchParams(window.location.search);
  if (params.get('w')) {
    try {
      return {
        word: decodeURIComponent(atob(params.get('w'))),
        definition: params.get('d')
          ? decodeURIComponent(atob(params.get('d')))
          : '선생님이 직접 출제하신 퀴즈입니다.'
      };
    } catch(e) {}
  }

  // 2) 교사가 오늘의 단어를 설정했는지 확인
  const dateStr = getKSTDateString();
  if (DB_SETTINGS.daily_word_data && DB_SETTINGS.daily_word_data[dateStr]) {
    return DB_SETTINGS.daily_word_data[dateStr];
  }

  // 3) 날짜 기반 결정론적 선택 (KST 자정 기준)
  const epoch   = new Date('2024-01-01T00:00:00+09:00').getTime();
  const todayTs = new Date(dateStr + 'T00:00:00+09:00').getTime();
  const dayNum  = Math.floor((todayTs - epoch) / 86400000);
  const list    = getActiveWordList();
  return list[Math.abs(dayNum) % list.length];
}

// ============================================================
// 게임 상태 저장 / 복원
// ============================================================
function getTodayStateKey() { return KEY_STATE_PREFIX + getKSTDateString(); }

function saveGameState() {
  const state = { wordUsed: solution.word, guesses, currentRow, currentCol, isGameOver, hintsUsed, tileStatesLog };
  localStorage.setItem(getTodayStateKey(), JSON.stringify(state));
}

function loadGameState() {
  try {
    const raw = localStorage.getItem(getTodayStateKey());
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

// ============================================================
// 게임 초기화
// ============================================================
function initGame() {
  solution      = getDailyWord();
  solutionJamos = getJamoList(solution.word);
  cols          = solutionJamos.length;

  const saved = loadGameState();
  if (saved && saved.wordUsed === solution.word) {
    restoreGameState(saved);
  } else {
    setupFreshGame();
  }
}

function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  board.style.setProperty('--cols', cols);

  for (let r = 0; r < MAX_ROWS; r++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.style.setProperty('--cols', cols);
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      row.appendChild(tile);
    }
    board.appendChild(row);
  }
}

function setupFreshGame() {
  buildBoard();
  guesses       = Array.from({ length: MAX_ROWS }, () => Array(cols).fill(''));
  tileStatesLog = [];
  currentRow    = 0;
  currentCol    = 0;
  isGameOver    = false;
  hintsUsed     = 0;
  resetKeyColors();
  resetHintPanel();
  updateHintButton();
  updateStudyModeButton();
}

function restoreGameState(state) {
  buildBoard();

  guesses       = state.guesses;
  tileStatesLog = state.tileStatesLog || [];
  currentRow    = state.currentRow;
  currentCol    = state.currentCol;
  isGameOver    = state.isGameOver;
  hintsUsed     = state.hintsUsed || 0;

  // 패딩
  while (guesses.length < MAX_ROWS) guesses.push(Array(cols).fill(''));

  // 완료된 행 타일 복원 (애니메이션 없이)
  for (let r = 0; r < tileStatesLog.length; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.getElementById(`tile-${r}-${c}`);
      if (!tile || !guesses[r]) continue;
      tile.textContent = guesses[r][c] || '';
      if (tileStatesLog[r][c]) {
        tile.classList.add(tileStatesLog[r][c]);
        updateKeyboardColor(guesses[r][c], tileStatesLog[r][c]);
      }
    }
  }

  // 진행 중인 행 복원
  if (!isGameOver && currentCol > 0 && guesses[currentRow]) {
    for (let c = 0; c < currentCol; c++) {
      const tile = document.getElementById(`tile-${currentRow}-${c}`);
      if (tile) tile.textContent = guesses[currentRow][c] || '';
    }
  }

  // 힌트 복원
  restoreHintState();
  updateHintButton();
  updateStudyModeButton();

  if (isGameOver) {
    forceShowAllHints();
    showToast('오늘의 꼬들이 이미 완료되었습니다!');
  }
}

// ============================================================
// 이벤트 리스너
// ============================================================
function setupEventListeners() {
  // 도움말·통계 모달
  setupModal('help-btn',  'help-modal',  'help-close');
  setupModal('stats-btn', 'stats-modal', 'stats-close');

  // 로고 클릭 — 새 단어로 리셋
  document.getElementById('logo').addEventListener('click', () => {
    if (isGameOver && !window.location.search) {
      showToast('오늘의 단어는 이미 완료되었습니다. 내일 다시 도전하세요!');
      return;
    }
    if (confirm('이 단어를 포기하고 새 단어로 시작할까요?')) {
      localStorage.removeItem(getTodayStateKey());
      window.location.href = window.location.pathname;
    }
  });

  // 테마 전환
  document.getElementById('theme-btn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // 공부 모드
  document.getElementById('study-btn').addEventListener('click', openStudyMode);
  document.getElementById('study-close').addEventListener('click', () =>
    document.getElementById('study-modal').classList.remove('open'));
  document.getElementById('study-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('study-modal'))
      document.getElementById('study-modal').classList.remove('open');
  });

  // 공부 모드 검색
  document.getElementById('study-search').addEventListener('input', filterStudyTable);

  // 통계
  document.getElementById('reset-stats-btn').addEventListener('click', () => {
    if (confirm('모든 통계를 초기화하시겠습니까?')) {
      stats = { played:0, won:0, currentStreak:0, maxStreak:0, distribution:[0,0,0,0,0,0] };
      saveStats();
      updateStatsModal();
      showToast('통계가 초기화되었습니다.');
    }
  });
  document.getElementById('share-btn').addEventListener('click', shareResult);

  // 힌트 패널
  document.getElementById('hint-btn-trigger').addEventListener('click', () =>
    document.getElementById('hint-panel').classList.add('open'));
  document.getElementById('hint-close-btn').addEventListener('click', () =>
    document.getElementById('hint-panel').classList.remove('open'));
  document.getElementById('hint-unlock-btn').addEventListener('click', unlockNextHint);

  // 가상 키보드 — click (마우스) + touchstart (터치)
  const keyboard = document.getElementById('keyboard');
  keyboard.addEventListener('click', e => {
    const key = e.target.closest('.key');
    if (key) handleInput(key.getAttribute('data-key'));
  });
  // 터치 디바이스에서 즉각 반응 (touchstart)
  keyboard.addEventListener('touchstart', e => {
    const key = e.target.closest('.key');
    if (key) {
      e.preventDefault(); // 더블탭 줌 방지
      handleInput(key.getAttribute('data-key'));
    }
  }, { passive: false });

  // 실물 키보드
  window.addEventListener('keydown', e => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (isGameOver) return;
    if (e.key === 'Enter') handleInput('ENTER');
    else if (e.key === 'Backspace') handleInput('BACKSPACE');
    else if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(e.key)) handleInput(e.key);
  });

  // 관리자 링크 — 교사 비밀번호 모달
  document.getElementById('admin-link').addEventListener('click', openTeacherPassModal);
  document.getElementById('teacher-pass-close').addEventListener('click', () =>
    document.getElementById('teacher-pass-modal').classList.remove('open'));
  document.getElementById('teacher-pass-submit').addEventListener('click', verifyTeacherPass);
  document.getElementById('teacher-pass-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') verifyTeacherPass();
  });

  // 교사 패널
  document.getElementById('teacher-panel-close').addEventListener('click', () =>
    document.getElementById('teacher-panel-modal').classList.remove('open'));

  // 탭 전환
  document.querySelectorAll('.teacher-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTeacherTab(btn.getAttribute('data-tab')));
  });

  // 교사 기능 버튼
  document.getElementById('teacher-set-daily-btn').addEventListener('click', setTeacherDailyWord);
  document.getElementById('teacher-generate-btn').addEventListener('click', generateCustomLink);
  document.getElementById('teacher-add-word-btn').addEventListener('click', addWordToList);
  document.getElementById('teacher-reset-wordlist-btn').addEventListener('click', resetWordlistToDefault);
  document.getElementById('teacher-change-pass-btn').addEventListener('click', changeTeacherPassword);
}

function setupModal(triggerId, modalId, closeId) {
  document.getElementById(triggerId).addEventListener('click', () => {
    if (modalId === 'stats-modal') updateStatsModal();
    document.getElementById(modalId).classList.add('open');
  });
  document.getElementById(closeId).addEventListener('click', () =>
    document.getElementById(modalId).classList.remove('open'));
  document.getElementById(modalId).addEventListener('click', e => {
    if (e.target === document.getElementById(modalId))
      document.getElementById(modalId).classList.remove('open');
  });
}

// ============================================================
// 입력 처리
// ============================================================
function handleInput(key) {
  if (isGameOver) return;
  if (key === 'ENTER')     submitGuess();
  else if (key === 'BACKSPACE') deleteLetter();
  else insertLetter(key);
}

function insertLetter(letter) {
  if (currentCol >= cols) return;
  guesses[currentRow][currentCol] = letter;
  const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
  tile.textContent = letter;
  tile.classList.remove('pop');
  void tile.offsetWidth; // reflow for re-trigger
  tile.classList.add('pop');
  currentCol++;
}

function deleteLetter() {
  if (currentCol <= 0) return;
  currentCol--;
  guesses[currentRow][currentCol] = '';
  const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
  tile.textContent = '';
  tile.classList.remove('pop');
}

function submitGuess() {
  if (currentCol < cols) {
    showToast(`${cols}칸을 모두 채워야 입력할 수 있어요!`);
    shakeRow();
    return;
  }
  revealRow();
}

function shakeRow() {
  for (let c = 0; c < cols; c++) {
    const tile = document.getElementById(`tile-${currentRow}-${c}`);
    tile.classList.remove('shake');
    void tile.offsetWidth;
    tile.classList.add('shake');
    setTimeout(() => tile.classList.remove('shake'), 500);
  }
}

// ============================================================
// 채점 및 타일 공개
// ============================================================
function revealRow() {
  isGameOver = true; // 애니메이션 중 입력 차단

  const guessRow     = guesses[currentRow];
  const targetCopy   = [...solutionJamos];
  const tileStates   = Array(cols).fill('absent');

  // 1차: 정확한 위치
  for (let c = 0; c < cols; c++) {
    if (guessRow[c] === targetCopy[c]) {
      tileStates[c] = 'correct';
      targetCopy[c] = null;
    }
  }
  // 2차: 포함이지만 위치 틀림
  for (let c = 0; c < cols; c++) {
    if (tileStates[c] === 'correct') continue;
    const idx = targetCopy.indexOf(guessRow[c]);
    if (idx !== -1) {
      tileStates[c] = 'present';
      targetCopy[idx] = null;
    }
  }

  // 타일 순차 플립
  for (let c = 0; c < cols; c++) {
    const tile = document.getElementById(`tile-${currentRow}-${c}`);
    setTimeout(() => {
      tile.classList.add('reveal');
      setTimeout(() => {
        tile.classList.add(tileStates[c]);
        updateKeyboardColor(guessRow[c], tileStates[c]);
      }, 250);
    }, c * 180);
  }

  // 애니메이션 완료 후
  setTimeout(() => {
    tileStatesLog.push([...tileStates]);
    const isWin = tileStates.every(s => s === 'correct');

    if (isWin) {
      handleGameEnd(true);
    } else if (currentRow >= MAX_ROWS - 1) {
      handleGameEnd(false);
    } else {
      currentRow++;
      currentCol  = 0;
      isGameOver  = false;
      saveGameState();
    }
  }, cols * 180 + 350);
}

function updateKeyboardColor(letter, state) {
  const btn = document.querySelector(`.key[data-key="${CSS.escape(letter)}"]`);
  if (!btn) return;
  if (state === 'correct') {
    btn.className = 'key correct';
  } else if (state === 'present' && !btn.classList.contains('correct')) {
    btn.className = 'key present';
  } else if (state === 'absent' && !btn.classList.contains('correct') && !btn.classList.contains('present')) {
    btn.className = 'key absent';
  }
}

function resetKeyColors() {
  document.querySelectorAll('.key').forEach(k => {
    k.classList.remove('correct', 'present', 'absent');
  });
}

// ============================================================
// 게임 종료
// ============================================================
function handleGameEnd(isWin) {
  isGameOver = true;
  stats.played++;

  if (isWin) {
    stats.won++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    stats.distribution[currentRow]++;
    setTimeout(() => showToast('🎉 정답입니다! 정말 잘 맞히셨어요!'), 300);
  } else {
    stats.currentStreak = 0;
    setTimeout(() => showToast(`아쉬워요 😢 정답은 [${solution.word}]이었습니다!`), 300);
  }

  saveStats();
  saveGameState();
  forceShowAllHints();
  updateStudyModeButton();

  setTimeout(() => {
    updateStatsModal();
    document.getElementById('stats-modal').classList.add('open');
  }, 1600);
}

// ============================================================
// 힌트 시스템
// ============================================================
function updateHintButton() {
  document.getElementById('hint-btn-trigger').textContent = `💡 힌트 보기 (${hintsUsed}/3)`;
}

function resetHintPanel() {
  document.getElementById('hint-stage-1').style.display = 'none';
  document.getElementById('hint-stage-2').style.display = 'none';
  document.getElementById('hint-stage-3').style.display = 'none';
  const btn = document.getElementById('hint-unlock-btn');
  btn.style.display = 'block';
  btn.textContent   = '1단계 힌트 열기';
}

function restoreHintState() {
  if (hintsUsed >= 1) {
    document.getElementById('hint-stage-1').style.display = 'flex';
    document.getElementById('hint-body-1').textContent = `${solution.word.length}음절 단어 (${cols}칸)`;
  }
  if (hintsUsed >= 2) {
    document.getElementById('hint-stage-2').style.display = 'flex';
    document.getElementById('hint-body-2').textContent = getChoseong(solution.word);
  }
  if (hintsUsed >= 3) {
    document.getElementById('hint-stage-3').style.display = 'flex';
    document.getElementById('hint-body-3').textContent = solution.definition;
  }
  const btn = document.getElementById('hint-unlock-btn');
  if (hintsUsed >= 3) {
    btn.style.display = 'none';
  } else {
    btn.style.display  = 'block';
    btn.textContent    = ['1단계 힌트 열기', '2단계 힌트 열기', '3단계 힌트 열기'][hintsUsed];
  }
}

function forceShowAllHints() {
  hintsUsed = 3;
  document.getElementById('hint-stage-1').style.display = 'flex';
  document.getElementById('hint-stage-2').style.display = 'flex';
  document.getElementById('hint-stage-3').style.display = 'flex';
  document.getElementById('hint-body-1').textContent = `${solution.word.length}음절 단어 (${cols}칸)`;
  document.getElementById('hint-body-2').textContent = getChoseong(solution.word);
  document.getElementById('hint-body-3').textContent = solution.definition;
  document.getElementById('hint-unlock-btn').style.display = 'none';
  updateHintButton();
}

function unlockNextHint() {
  if (hintsUsed >= 3) return;
  hintsUsed++;
  updateHintButton();

  const messages = ['', '1단계 힌트(글자 수)가 해제되었습니다.', '2단계 힌트(초성)가 해제되었습니다.', '3단계 힌트(뜻)가 해제되었습니다.'];
  showToast(messages[hintsUsed]);

  if (hintsUsed === 1) {
    document.getElementById('hint-stage-1').style.display = 'flex';
    document.getElementById('hint-body-1').textContent = `${solution.word.length}음절 단어 (${cols}칸)`;
    document.getElementById('hint-unlock-btn').textContent = '2단계 힌트 열기';
  } else if (hintsUsed === 2) {
    document.getElementById('hint-stage-2').style.display = 'flex';
    document.getElementById('hint-body-2').textContent = getChoseong(solution.word);
    document.getElementById('hint-unlock-btn').textContent = '3단계 힌트 열기';
  } else {
    document.getElementById('hint-stage-3').style.display = 'flex';
    document.getElementById('hint-body-3').textContent = solution.definition;
    document.getElementById('hint-unlock-btn').style.display = 'none';
  }

  if (!isGameOver) saveGameState();
}

// ============================================================
// 공부 모드
// ============================================================
function updateStudyModeButton() {
  const btn = document.getElementById('study-btn');
  if (isGameOver) {
    btn.classList.remove('locked');
    btn.title = '공부 모드 — 단어 목록 보기';
  } else {
    btn.classList.add('locked');
    btn.title = '꼬들을 완료해야 공부 모드를 열 수 있어요!';
  }
}

let allStudyWords = [];

function openStudyMode() {
  if (!isGameOver) {
    showToast('🔒 오늘의 꼬들을 완료해야 공부 모드를 열 수 있어요!');
    return;
  }

  allStudyWords = getActiveWordList();
  renderStudyTable(allStudyWords);
  document.getElementById('study-search').value = '';
  document.getElementById('study-modal').classList.add('open');
}

function renderStudyTable(list) {
  const tbody = document.getElementById('study-table-body');
  tbody.innerHTML = '';
  document.getElementById('study-count-label').textContent = `전체 ${list.length}개 단어`;

  list.forEach((item, idx) => {
    const jamoCount = getJamoList(item.word).length;
    const cho       = getChoseong(item.word);
    const isToday   = item.word === solution.word;
    const tr        = document.createElement('tr');
    if (isToday) tr.classList.add('today-word-row');

    tr.innerHTML = `
      <td style="color:var(--text-sub);font-size:11px;">${idx + 1}</td>
      <td class="study-word-cell">${item.word}${isToday ? ' ⭐' : ''}</td>
      <td style="font-size:12px;color:var(--text-sub);">${item.word.length}음절 / ${jamoCount}칸</td>
      <td class="study-cho-cell">${cho}</td>
      <td class="study-def-cell">${item.definition}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterStudyTable() {
  const q = document.getElementById('study-search').value.trim().toLowerCase();
  if (!q) { renderStudyTable(allStudyWords); return; }
  const filtered = allStudyWords.filter(w =>
    w.word.includes(q) || w.definition.toLowerCase().includes(q)
  );
  renderStudyTable(filtered);
  document.getElementById('study-count-label').textContent = `검색 결과: ${filtered.length}개`;
}

// ============================================================
// 교사 모드
// ============================================================
function openTeacherPassModal() {
  document.getElementById('teacher-pass-input').value = '';
  document.getElementById('teacher-pass-error').style.display = 'none';
  document.getElementById('teacher-pass-modal').classList.add('open');
  setTimeout(() => document.getElementById('teacher-pass-input').focus(), 250);
}

function verifyTeacherPass() {
  const input  = document.getElementById('teacher-pass-input').value;
  if (input === DB_SETTINGS.teacher_pass) {
    document.getElementById('teacher-pass-modal').classList.remove('open');
    openTeacherPanel();
  } else {
    document.getElementById('teacher-pass-error').style.display = 'block';
    document.getElementById('teacher-pass-input').value = '';
    document.getElementById('teacher-pass-input').focus();
  }
}

function openTeacherPanel() {
  const dateStr   = getKSTDateString();
  const todayWord = getDailyWord();
  document.getElementById('teacher-today-display').textContent =
    `현재 오늘의 단어: "${todayWord.word}" (${dateStr} KST 기준)`;

  // 첫 번째 탭 활성화
  switchTeacherTab('daily');
  renderTeacherWordList();
  document.getElementById('teacher-panel-modal').classList.add('open');
}

function switchTeacherTab(tabName) {
  document.querySelectorAll('.teacher-tab-btn').forEach(b =>
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName));
  document.querySelectorAll('.teacher-tab-content').forEach(c =>
    c.classList.toggle('active', c.id === `tab-${tabName}`));
}

async function setTeacherDailyWord() {
  const wordInput = document.getElementById('teacher-daily-word').value.trim();
  const defInput  = document.getElementById('teacher-daily-def').value.trim();

  if (!wordInput) { showToast('단어를 입력해 주세요.'); return; }

  const jamoCount = getJamoList(wordInput).length;
  if (jamoCount < 5 || jamoCount > 7) {
    showToast(`⚠️ "${wordInput}"의 자모수는 ${jamoCount}개입니다.\n5~7개 범위의 단어를 입력해 주세요.`);
    return;
  }

  // DB에서 뜻 자동 검색
  const dbEntry = getActiveWordList().find(w => w.word === wordInput);
  const wordObj = {
    word: wordInput,
    definition: dbEntry ? dbEntry.definition : (defInput || '(뜻 미입력)')
  };

  const dateStr = getKSTDateString();
  DB_SETTINGS.daily_word_data[dateStr] = wordObj;
  
  await supabaseClient.from('app_settings').update({ daily_word_data: DB_SETTINGS.daily_word_data }).eq('id', 1);
  localStorage.removeItem(KEY_STATE_PREFIX + dateStr); // 오늘 게임 초기화

  showToast(`✅ 오늘의 단어가 "${wordInput}"(으)로 설정되었습니다!\n학생들이 새로고침하면 반영됩니다.`);
  document.getElementById('teacher-today-display').textContent =
    `현재 오늘의 단어: "${wordInput}" (${dateStr} KST 기준)`;
  document.getElementById('teacher-daily-word').value = '';
  document.getElementById('teacher-daily-def').value  = '';
}

function generateCustomLink() {
  const word = document.getElementById('custom-word').value.trim();
  const def  = document.getElementById('custom-definition').value.trim();

  if (!word) { showToast('단어를 입력해 주세요.'); return; }
  const jCount = getJamoList(word).length;
  if (jCount < 5 || jCount > 7) {
    showToast(`⚠️ 자모수 ${jCount}개. 5~7개 범위의 단어를 입력해 주세요.`);
    return;
  }

  const enc  = btoa(encodeURIComponent(word));
  const dEnc = btoa(encodeURIComponent(def || '선생님이 준비한 오늘의 낱말입니다.'));
  const url  = `${location.origin}${location.pathname}?w=${enc}&d=${dEnc}`;

  document.getElementById('link-copy-input').value = url;
  document.getElementById('link-result-box').classList.add('show');

  const oldBtn = document.getElementById('link-copy-btn');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', () =>
    navigator.clipboard.writeText(url).then(() => showToast('링크가 복사되었습니다!')));
}

function renderTeacherWordList() {
  const list = getActiveWordList();
  document.getElementById('teacher-wordcount').textContent = `총 ${list.length}개 단어`;

  const container = document.getElementById('teacher-wordlist-container');
  container.innerHTML = '';

  list.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'teacher-word-item';
    div.innerHTML = `
      <div class="teacher-word-info">
        <span class="tw-word">${item.word}</span>
        <span class="tw-def">${item.definition}</span>
      </div>
      <button class="tw-delete-btn" title="삭제">✕</button>
    `;
    div.querySelector('.tw-delete-btn').addEventListener('click', () => deleteWordFromList(idx));
    container.appendChild(div);
  });
}

async function addWordToList() {
  const word = document.getElementById('new-word-input').value.trim();
  const def  = document.getElementById('new-def-input').value.trim();

  if (!word || !def) { showToast('단어와 뜻을 모두 입력해 주세요.'); return; }

  const jCount = getJamoList(word).length;
  if (jCount < 5 || jCount > 7) {
    showToast(`⚠️ "${word}"의 자모수는 ${jCount}개입니다.\n5~7개 범위만 추가 가능합니다.`);
    return;
  }

  const list = getActiveWordList();
  if (list.some(w => w.word === word)) { showToast('이미 목록에 있는 단어입니다.'); return; }

  const { error } = await supabaseClient.from('words_list').insert({ word, definition: def });
  if (!error) {
    await loadSupabaseData();
    document.getElementById('new-word-input').value = '';
    document.getElementById('new-def-input').value  = '';
    renderTeacherWordList();
    showToast(`✅ "${word}" 단어가 추가되었습니다.`);
  } else {
    showToast('저장 중 오류가 발생했습니다.');
  }
}

async function deleteWordFromList(idx) {
  const list = getActiveWordList();
  if (list.length <= 1) { showToast('최소 1개 이상의 단어가 필요합니다.'); return; }
  const removed = list[idx];
  
  const { error } = await supabaseClient.from('words_list').delete().eq('word', removed.word);
  if (!error) {
    await loadSupabaseData();
    renderTeacherWordList();
    showToast(`"${removed.word}" 단어가 삭제되었습니다.`);
  } else {
    showToast('삭제 중 오류가 발생했습니다.');
  }
}

async function resetWordlistToDefault() {
  if (confirm('클라우드 환경에서는 지원되지 않습니다.')) {
    showToast('오류 방지를 위해 개별 삭제를 이용해 주세요.');
  }
}

async function changeTeacherPassword() {
  const np = document.getElementById('new-pass-input').value;
  const cp = document.getElementById('confirm-pass-input').value;

  if (!np)         { showToast('새 비밀번호를 입력해 주세요.'); return; }
  if (np !== cp)   { showToast('비밀번호가 일치하지 않습니다.'); return; }
  if (np.length < 2){ showToast('비밀번호는 2자 이상이어야 합니다.'); return; }

  const { error } = await supabaseClient.from('app_settings').update({ teacher_pass: np }).eq('id', 1);
  if (!error) {
    DB_SETTINGS.teacher_pass = np;
    document.getElementById('new-pass-input').value    = '';
    document.getElementById('confirm-pass-input').value = '';
    showToast(`✅ 비밀번호가 변경되었습니다. 잘 기억해 두세요!`);
  } else {
    showToast('비밀번호 변경 중 오류가 발생했습니다.');
  }
}

// ============================================================
// 통계 & 공유
// ============================================================
function loadStats() {
  try {
    const s = localStorage.getItem(KEY_STATS);
    if (s) stats = JSON.parse(s);
  } catch(e) {}
}

function saveStats() { localStorage.setItem(KEY_STATS, JSON.stringify(stats)); }

function updateStatsModal() {
  document.getElementById('stats-played').textContent    = stats.played;
  const pct = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  document.getElementById('stats-winpct').textContent    = `${pct}%`;
  document.getElementById('stats-streak').textContent    = stats.currentStreak;
  document.getElementById('stats-maxstreak').textContent = stats.maxStreak;
}

function shareResult() {
  const pct     = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const dateStr = getKSTDateString();
  const row     = (isGameOver && tileStatesLog[tileStatesLog.length - 1] &&
    tileStatesLog[tileStatesLog.length - 1].every(s => s === 'correct'))
    ? currentRow + 1 : 'X';

  const text = `📚 교과서 꼬들 (${dateStr})\n` +
               `${row}/${MAX_ROWS} 시도 · 힌트 ${hintsUsed}/3단계\n` +
               `통계 ${stats.played}판 / 승률 ${pct}%\n\n` +
               `kordle.kr 규칙 기반 🇰🇷\n` +
               `${location.origin}${location.pathname}`;

  navigator.clipboard.writeText(text)
    .then(() => showToast('결과가 클립보드에 복사되었습니다!'))
    .catch(() => showToast('복사에 실패했습니다.'));
}

// ============================================================
// 테마 & 유틸
// ============================================================
function getPreferredTheme() {
  return localStorage.getItem(KEY_THEME) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(KEY_THEME, theme);
  document.getElementById('theme-btn').textContent = theme === 'dark' ? '☀️' : '🌓';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
