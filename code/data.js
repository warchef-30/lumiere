// ═══════════════════════════════════════════════════════
//  data.js  —  全局实验状态 + Google Sheets 提交
//  依赖：CONFIG（来自 config.js，必须先加载）
// ═══════════════════════════════════════════════════════

// ── 全局实验状态 ──────────────────────────────────────
const State = {
  participantId: crypto.randomUUID(),
  group:         Math.ceil(Math.random() * 4),  // 1–4，随机分配
  startTime:     Date.now(),
  tabSwitched:   false,   // 是否中途切换过页面
  baseline:      {},      // 基线问卷数据
  mood:          {},      // 情绪问卷数据
  sartTrials:    [],      // 每一题 SART 原始记录
};

// ── 页面切换检测 ──────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) State.tabSwitched = true;
});

// ── 数据提交 ──────────────────────────────────────────
function submitData() {
  const trials = State.sartTrials;
  const rtVals = trials.filter(t => t.responded && t.rt !== null).map(t => t.rt);

  const meanRT = rtVals.length
    ? Math.round(rtVals.reduce((a, v) => a + v, 0) / rtVals.length)
    : null;

  const sdRT = rtVals.length > 1
    ? Math.round(Math.sqrt(
        rtVals.reduce((s, v) => s + Math.pow(v - meanRT, 2), 0) / rtVals.length
      ))
    : null;

  const payload = {
    participant_id:         State.participantId,
    timestamp:              new Date().toISOString(),
    group:                  State.group,
    group_label:            `组${State.group}`,
    bl_sleep:               State.baseline.sleep,
    bl_activity:            State.baseline.activity,
    bl_energy:              State.baseline.energy,
    bl_stress:              State.baseline.stress,
    mood_happy:             State.mood.happy,
    mood_sad:               State.mood.sad,
    sm_hours:               State.mood.smHours,
    sm_type:                State.mood.smType,
    sart_commission_errors: trials.filter(t => t.type === 'commission_error').length,
    sart_omission_errors:   trials.filter(t => t.type === 'omission_error').length,
    sart_mean_rt_ms:        meanRT,
    sart_sdrt_ms:           sdRT,
    tab_switched:           State.tabSwitched,
    sart_trials:            JSON.stringify(trials),
  };

  // 显示参与者编号（完成页）
  const el = document.getElementById('completionId');
  if (el) el.textContent = State.participantId.slice(0, 8).toUpperCase();

  // 提交到 Google Sheets
  if (CONFIG.sheetsUrl !== 'YOUR_APPS_SCRIPT_URL_HERE') {
    fetch(CONFIG.sheetsUrl, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    }).catch(e => console.warn('提交失败:', e));
  } else {
    console.log('📊 实验数据（未配置提交 URL）:', payload);
  }
}
