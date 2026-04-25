// ═══════════════════════════════════════════════════════
//  data.js  —  全局实验状态 + Google Sheets 提交
//  依赖：CONFIG（来自 config.js，必须先加载）
//  v1.2 — 逐 commit 实时上报；基线问卷改为 4 维 mood；新增 video_interest
// ═══════════════════════════════════════════════════════

// ── 全局实验状态 ──────────────────────────────────────
const State = {
  participantId:  crypto.randomUUID(),
  group:          Math.ceil(Math.random() * 4),  // 1–4，随机分配
  startTime:      Date.now(),
  tabSwitched:    false,
  baseline:       {},   // { sleep, activity, bl_mood_happy, bl_mood_sad, bl_mood_energetic, bl_mood_tired }
  mood:           {},   // { videoInterest, happy, sad, energetic, tired }
  phoneUse:       {},   // { tempted, picked }
  demographics:   {},   // { smHours, smType, videogameHours, age, gender, location, email }
  preSartTrials:  [],
  postSartTrials: [],
  lastScreen:     null,
};

// ── 页面切换检测 ──────────────────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) State.tabSwitched = true;
});

// ── SART 统计计算 ─────────────────────────────────────
function computeSartStats(trials) {
  const rtVals = trials.filter(t => t.responded && t.rt !== null).map(t => t.rt);

  const meanRT = rtVals.length
    ? Math.round(rtVals.reduce((a, v) => a + v, 0) / rtVals.length)
    : null;

  const sdRT = rtVals.length > 1
    ? Math.round(Math.sqrt(
        rtVals.reduce((s, v) => s + Math.pow(v - meanRT, 2), 0) / rtVals.length
      ))
    : null;

  const commissionErrors = trials.filter(t => t.type === 'commission_error').length;
  const omissionErrors   = trials.filter(t => t.type === 'omission_error').length;
  const accuracy = trials.length
    ? Math.round(((trials.length - commissionErrors - omissionErrors) / trials.length) * 100)
    : 0;

  return { meanRT, sdRT, commissionErrors, omissionErrors, accuracy };
}

// ── 低层提交 ──────────────────────────────────────────
function _pushToSheet(payload) {
  if (CONFIG.sheetsUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
    console.log('📊 实验数据（未配置提交 URL）:', payload);
    return;
  }
  fetch(CONFIG.sheetsUrl, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body:    JSON.stringify(payload),
  }).catch(e => console.warn('提交失败:', e));
}

// ── 逐屏提交（修改③）────────────────────────────────
// 每到一个关键 screen 就调用，将当前已有数据 upsert 到同一行
function commitProgress(screenId) {
  State.lastScreen = screenId;

  const partial = {
    participant_id: State.participantId,
    timestamp:      new Date().toISOString(),
    group:          State.group,
    group_label:    `组${State.group}`,
    last_screen:    screenId,

    // 基线
    bl_sleep:              State.baseline.sleep              ?? '',
    bl_activity:           State.baseline.activity           ?? '',
    bl_mood_happy:         State.baseline.bl_mood_happy      ?? '',
    bl_mood_sad:           State.baseline.bl_mood_sad        ?? '',
    bl_mood_energetic:     State.baseline.bl_mood_energetic  ?? '',
    bl_mood_tired:         State.baseline.bl_mood_tired      ?? '',

    // 视频 + 情绪
    video_interest:        State.mood.videoInterest ?? '',
    mood_happy:            State.mood.happy         ?? '',
    mood_sad:              State.mood.sad           ?? '',
    mood_energetic:        State.mood.energetic     ?? '',
    mood_tired:            State.mood.tired         ?? '',

    // 手机使用
    phone_tempted:         State.phoneUse.tempted   ?? '',
    phone_picked:          State.phoneUse.picked    ?? '',

    // SART 统计（有数据时填入）
    pre_sart_commission_errors:  '',
    pre_sart_omission_errors:    '',
    pre_sart_mean_rt_ms:         '',
    pre_sart_sdrt_ms:            '',
    post_sart_commission_errors: '',
    post_sart_omission_errors:   '',
    post_sart_mean_rt_ms:        '',
    post_sart_sdrt_ms:           '',

    // 基本信息
    sm_hours:        State.demographics.smHours        ?? '',
    sm_type:         State.demographics.smType         ?? '',
    videogame_hours: State.demographics.videogameHours ?? '',
    age:             State.demographics.age            ?? '',
    gender:          State.demographics.gender         ?? '',
    location:        State.demographics.location       ?? '',
    email:           State.demographics.email          ?? '',

    // 元数据
    tab_switched:     State.tabSwitched,
    pre_sart_trials:  '',
    post_sart_trials: '',
  };

  if (State.preSartTrials.length > 0) {
    const pre = computeSartStats(State.preSartTrials);
    partial.pre_sart_commission_errors = pre.commissionErrors;
    partial.pre_sart_omission_errors   = pre.omissionErrors;
    partial.pre_sart_mean_rt_ms        = pre.meanRT;
    partial.pre_sart_sdrt_ms           = pre.sdRT;
    partial.pre_sart_trials            = JSON.stringify(State.preSartTrials);
  }
  if (State.postSartTrials.length > 0) {
    const post = computeSartStats(State.postSartTrials);
    partial.post_sart_commission_errors = post.commissionErrors;
    partial.post_sart_omission_errors   = post.omissionErrors;
    partial.post_sart_mean_rt_ms        = post.meanRT;
    partial.post_sart_sdrt_ms           = post.sdRT;
    partial.post_sart_trials            = JSON.stringify(State.postSartTrials);
  }

  _pushToSheet(partial);
}

// ── 最终提交（实验全部完成）──────────────────────────
function submitData() {
  const pre  = computeSartStats(State.preSartTrials);
  const post = computeSartStats(State.postSartTrials);

  const payload = {
    participant_id: State.participantId,
    timestamp:      new Date().toISOString(),
    group:          State.group,
    group_label:    `组${State.group}`,
    last_screen:    'complete',

    // 基线
    bl_sleep:              State.baseline.sleep,
    bl_activity:           State.baseline.activity,
    bl_mood_happy:         State.baseline.bl_mood_happy,
    bl_mood_sad:           State.baseline.bl_mood_sad,
    bl_mood_energetic:     State.baseline.bl_mood_energetic,
    bl_mood_tired:         State.baseline.bl_mood_tired,

    // 视频 + 情绪
    video_interest:        State.mood.videoInterest,
    mood_happy:            State.mood.happy,
    mood_sad:              State.mood.sad,
    mood_energetic:        State.mood.energetic,
    mood_tired:            State.mood.tired,

    // 手机使用
    phone_tempted:         State.phoneUse.tempted,
    phone_picked:          State.phoneUse.picked,

    // Pre-SART
    pre_sart_commission_errors:  pre.commissionErrors,
    pre_sart_omission_errors:    pre.omissionErrors,
    pre_sart_mean_rt_ms:         pre.meanRT,
    pre_sart_sdrt_ms:            pre.sdRT,

    // Post-SART
    post_sart_commission_errors: post.commissionErrors,
    post_sart_omission_errors:   post.omissionErrors,
    post_sart_mean_rt_ms:        post.meanRT,
    post_sart_sdrt_ms:           post.sdRT,

    // 基本信息
    sm_hours:        State.demographics.smHours,
    sm_type:         State.demographics.smType,
    videogame_hours: State.demographics.videogameHours,
    age:             State.demographics.age,
    gender:          State.demographics.gender,
    location:        State.demographics.location,
    email:           State.demographics.email,

    // 元数据
    tab_switched:     State.tabSwitched,
    pre_sart_trials:  JSON.stringify(State.preSartTrials),
    post_sart_trials: JSON.stringify(State.postSartTrials),
  };

  // 显示参与者编号
  const el = document.getElementById('completionId');
  if (el) el.textContent = State.participantId.slice(0, 8).toUpperCase();

  // 显示 Pre-SART 评分
  const preAccEl  = document.getElementById('preAccuracy');
  const preRtEl   = document.getElementById('preMeanRT');
  const preErrEl  = document.getElementById('preErrors');
  if (preAccEl) preAccEl.textContent = pre.accuracy + '%';
  if (preRtEl)  preRtEl.textContent  = pre.meanRT ? pre.meanRT + ' ms' : '—';
  if (preErrEl) preErrEl.textContent = pre.commissionErrors;

  // 显示 Post-SART 评分
  const postAccEl  = document.getElementById('postAccuracy');
  const postRtEl   = document.getElementById('postMeanRT');
  const postErrEl  = document.getElementById('postErrors');
  if (postAccEl) postAccEl.textContent = post.accuracy + '%';
  if (postRtEl)  postRtEl.textContent  = post.meanRT ? post.meanRT + ' ms' : '—';
  if (postErrEl) postErrEl.textContent = post.commissionErrors;

  _pushToSheet(payload);
}
