// ═══════════════════════════════════════════════════════
//  experiment.js  —  Lumiere SART 实验主逻辑
//  依赖：CONFIG（config.js）、State + submitData（data.js）
// ═══════════════════════════════════════════════════════

// ── 屏幕管理 ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Debug 导航面板（仅 CONFIG.debug = true 时显示）──────
if (CONFIG.debug) {
  const screens = [
    { id: 's-welcome',    label: '1 欢迎' },
    { id: 's-countdown',  label: '2 倒计时' },
    { id: 's-baseline',   label: '3 基线问卷' },
    { id: 's-video-intro',label: '4 视频说明' },
    { id: 's-video',      label: '5 视频播放' },
    { id: 's-mood',       label: '6 情绪问卷' },
    { id: 's-sart-intro', label: '7 SART说明' },
    { id: 's-sart',       label: '8 SART测试' },
    { id: 's-sart-break', label: '9 练习完成' },
    { id: 's-complete',   label: '10 完成' },
  ];

  const nav = document.createElement('div');
  nav.style.cssText = `
    position: fixed; top: 10px; right: 10px; z-index: 9999;
    background: rgba(0,0,0,0.8); border-radius: 8px;
    padding: 8px; display: flex; flex-direction: column; gap: 4px;
    font-size: 11px;
  `;

  screens.forEach(({ id, label }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `
      background: #374151; color: #fff; border: none;
      border-radius: 4px; padding: 4px 8px; cursor: pointer;
      text-align: left; white-space: nowrap;
    `;
    btn.addEventListener('click', () => showScreen(id));
    nav.appendChild(btn);
  });

  document.body.appendChild(nav);
}

// ── 时间格式化 ────────────────────────────────────────
function fmtTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m} : ${s}`;
}

// ── SART 序列生成（Robertson et al., 1997）────────────
// 每个数字 1–9 出现 n/9 次，打乱后保证目标数字不连续
function generateSartTrials(n) {
  const reps = n / 9;
  const pool = [];
  for (let d = 1; d <= 9; d++)
    for (let r = 0; r < reps; r++) pool.push(d);

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 修复连续目标数字（目标数字 3 不连续出现）
  const T = CONFIG.sart.target;
  for (let i = 0; i < pool.length - 1; i++) {
    if (pool[i] === T && pool[i + 1] === T) {
      for (let j = i + 2; j < pool.length; j++) {
        if (pool[j] !== T) { [pool[i + 1], pool[j]] = [pool[j], pool[i + 1]]; break; }
      }
    }
  }
  return pool;
}

// ── SART 内部状态 ─────────────────────────────────────
const _sart = {
  trials:         [],
  index:          0,
  isPractice:     true,
  digitTimer:     null,
  maskTimer:      null,
  responseWindow: false,
  responded:      false,
  trialStart:     0,
  currentRt:      null,
};

// ── 视频计时器 ────────────────────────────────────────
let _videoTimer = null;

// ════════════════════════════════════════════════════════
//  SCREEN 1 → 2: 欢迎 → 倒计时
// ════════════════════════════════════════════════════════
document.getElementById('btn-start').addEventListener('click', () => {
  showScreen('s-countdown');
  let t = 10;
  document.getElementById('countdownNumber').textContent = t;
  const iv = setInterval(() => {
    t--;
    document.getElementById('countdownNumber').textContent = t;
    if (t <= 0) { clearInterval(iv); showScreen('s-baseline'); }
  }, 1000);
});

// ════════════════════════════════════════════════════════
//  SCREEN 3: 基线问卷提交
// ════════════════════════════════════════════════════════
document.getElementById('btn-baseline-submit').addEventListener('click', () => {
  const sleep    = document.getElementById('bl-sleep').value;
  const activity = document.getElementById('bl-activity').value;
  const energy   = document.querySelector('input[name="bl-energy"]:checked')?.value;
  const stress   = document.querySelector('input[name="bl-stress"]:checked')?.value;

  if (!sleep || !activity || !energy || !stress) {
    alert('请填写全部问题后继续。');
    return;
  }

  State.baseline = { sleep: +sleep, activity, energy: +energy, stress: +stress };

  const groupCfg = CONFIG.videos[State.group];
  document.getElementById('video-group-hint').textContent =
    `你将观看约 ${groupCfg.durationSec / 60} 分钟的视频`;

  showScreen('s-video-intro');
});

// ════════════════════════════════════════════════════════
//  SCREEN 4 → 5: 视频说明 → 视频播放
// ════════════════════════════════════════════════════════
document.getElementById('btn-video-start').addEventListener('click', () => {
  showScreen('s-video');

  const groupCfg = CONFIG.videos[State.group];
  const frame    = document.getElementById('videoFrame');

  // autoplay=1, controls=0, disablekb=1 防止跳过；rel=0 不显示相关推荐
  frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;

  document.getElementById('video-group-tag').textContent = `组${State.group}`;

  // debug 模式显示跳过按钮
  document.getElementById('btn-video-skip').style.display =
    CONFIG.debug ? 'block' : 'none';

  // 倒计时
  let remaining = groupCfg.durationSec;
  const timerEl = document.getElementById('videoTimer');
  const fillEl  = document.getElementById('videoProgressFill');
  timerEl.textContent = `剩余时间：${fmtTime(remaining)}`;

  _videoTimer = setInterval(() => {
    remaining--;
    timerEl.textContent = `剩余时间：${fmtTime(Math.max(0, remaining))}`;
    fillEl.style.width  = ((1 - remaining / groupCfg.durationSec) * 100) + '%';
    if (remaining <= 0) { clearInterval(_videoTimer); _afterVideo(); }
  }, 1000);
});

document.getElementById('btn-video-skip').addEventListener('click', () => {
  clearInterval(_videoTimer);
  _afterVideo();
});

function _afterVideo() {
  document.getElementById('videoFrame').src = 'about:blank';
  showScreen('s-mood');
}

// ════════════════════════════════════════════════════════
//  SCREEN 6: 情绪问卷提交
// ════════════════════════════════════════════════════════
document.getElementById('btn-mood-submit').addEventListener('click', () => {
  const happy   = document.querySelector('input[name="mood-happy"]:checked')?.value;
  const sad     = document.querySelector('input[name="mood-sad"]:checked')?.value;
  const smHours = document.getElementById('sm-hours').value;
  const smType  = document.getElementById('sm-type').value;

  if (!happy || !sad || !smHours || !smType) {
    alert('请完成全部问题后继续。');
    return;
  }

  State.mood = { happy: +happy, sad: +sad, smHours: +smHours, smType };
  showScreen('s-sart-intro');
});

// ════════════════════════════════════════════════════════
//  SCREEN 7 → 8: SART 说明 → 练习
// ════════════════════════════════════════════════════════
document.getElementById('btn-sart-practice').addEventListener('click', () => {
  _sart.trials     = generateSartTrials(CONFIG.sart.practiceTrials);
  _sart.index      = 0;
  _sart.isPractice = true;
  showScreen('s-sart');
  _runSartTrial();
});

// SCREEN 9 → 8: 练习完成 → 正式测试
document.getElementById('btn-sart-main').addEventListener('click', () => {
  _sart.trials     = generateSartTrials(CONFIG.sart.mainTrials);
  _sart.index      = 0;
  _sart.isPractice = false;
  showScreen('s-sart');
  _runSartTrial();
});

// ════════════════════════════════════════════════════════
//  SART 核心引擎
// ════════════════════════════════════════════════════════
function _runSartTrial() {
  if (_sart.index >= _sart.trials.length) {
    if (_sart.isPractice) { showScreen('s-sart-break'); }
    else                  { showScreen('s-complete'); submitData(); }
    return;
  }

  const num      = _sart.trials[_sart.index];
  const isTarget = num === CONFIG.sart.target;
  const fontSize = CONFIG.sart.fontSizes[
    Math.floor(Math.random() * CONFIG.sart.fontSizes.length)
  ];

  const digitEl    = document.getElementById('sartDigit');
  const maskEl     = document.getElementById('sartMask');
  const phaseEl    = document.getElementById('sartPhaseLabel');
  const feedbackEl = document.getElementById('sartFeedback');
  const progressEl = document.getElementById('sartProgress');

  phaseEl.textContent    = `${_sart.isPractice ? '练习' : '正式测试'} · ${_sart.index + 1} / ${_sart.trials.length}`;
  feedbackEl.textContent = '';
  progressEl.textContent = '';

  _sart.responded      = false;
  _sart.currentRt      = null;
  _sart.responseWindow = false;

  // Phase 1: 显示数字（digitMs = 250ms）
  maskEl.style.display   = 'none';
  digitEl.style.display  = 'block';
  digitEl.textContent    = num;
  digitEl.style.fontSize = fontSize + 'px';

  _sart.trialStart     = performance.now();
  _sart.responseWindow = true;

  _sart.digitTimer = setTimeout(() => {
    // Phase 2: 显示 circle-cross mask（maskMs = 900ms）
    digitEl.style.display = 'none';
    maskEl.style.display  = 'flex';

    _sart.maskTimer = setTimeout(() => {
      _sart.responseWindow = false;
      maskEl.style.display = 'none';

      _recordTrial(num, isTarget, _sart.responded, _sart.currentRt);

      // 练习阶段显示对错反馈
      if (_sart.isPractice) {
        const correct = isTarget ? !_sart.responded : _sart.responded;
        feedbackEl.textContent = correct
          ? '✓ 正确'
          : (isTarget ? '✗ 错误：见到 3 不应该按键' : '✗ 错误：应该按键');
        feedbackEl.className = correct ? 'fb-ok' : 'fb-err';
      }

      _sart.index++;
      setTimeout(_runSartTrial, _sart.isPractice ? 300 : 0);

    }, CONFIG.sart.maskMs);
  }, CONFIG.sart.digitMs);
}

function _recordTrial(num, isTarget, responded, rt) {
  const type = isTarget
    ? (responded  ? 'commission_error'  : 'correct_inhibition')
    : (!responded ? 'omission_error'    : 'correct_response');
  const correct = isTarget ? !responded : responded;
  if (!_sart.isPractice) {
    State.sartTrials.push({ num, isTarget, responded, rt, correct, type });
  }
}

// ── 响应：空格键 + 点击屏幕 ──────────────────────────
function _handleResponse() {
  if (!_sart.responseWindow || _sart.responded) return;
  _sart.responded = true;
  _sart.currentRt = performance.now() - _sart.trialStart;
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); _handleResponse(); }
});
document.getElementById('sartStimulus').addEventListener('click', _handleResponse);
