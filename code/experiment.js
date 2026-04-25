// ═══════════════════════════════════════════════════════
//  experiment.js  —  Lumiere SART 实验主逻辑
//  依赖：CONFIG（config.js）、State + submitData（data.js）
//  v1.1 — Pre/Post SART 前后测设计
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
//  双语翻译表
// ═══════════════════════════════════════════════════════
const TRANS = {
  zh: {
    pageTitle: '注意力研究实验',
    s1_h1: '注意力研究实验',
    s1_p1: '感谢你参与本次研究！',
    s1_p2: '本实验包括：<strong>注意力测试 → 观看视频 → 注意力测试 → 简短问卷</strong>，全程约 25–35 分钟。',
    s1_p3: '请在安静的环境中独立完成，中途不要使用手机或切换页面。',
    s1_hint: '所有数据匿名保存，仅用于学术研究。',
    btn_start: '我准备好了，开始',

    s2_h2: '请放松坐好',
    s2_p: '保持安静，等待实验开始。',
    s2_hint: '倒计时结束后自动进入下一步',

    s3_h2: '开始前的几个小问题',
    s3_hint: '帮助我们了解你现在的状态，全部必填。',
    bl_sleep_label: '昨晚你睡了几个小时？',
    bl_sleep_ph: '例如：7',
    bl_activity_label: '过去 30 分钟你主要在做什么？',
    opt_select: '请选择',
    opt_resting: '休息 / 放松',
    opt_studying: '上课 / 学习',
    opt_light: '轻度活动（散步、站立等）',
    opt_exercise: '运动 / 体育活动',
    opt_other: '其他',
    btn_continue: '继续',

    // SART 说明（纯文字）
    s_intro_h2: '注意力任务说明',
    s_intro_p1: '接下来你将完成一项注意力测试。屏幕中央会依次快速出现数字 1–9。',
    s_intro_p2: '请尽可能快且准确地做出反应。每个数字只出现很短时间。<br>⭕ 数字消失后会出现一个带 ✕ 的圆圈（⊗），用于消除上一个数字的残影，防止残影对你判断下一题造成干扰。看到它时无需操作，等待下一个数字即可。',
    s_intro_hint: '请先仔细阅读规则，下一页将展示演示动画和练习。',
    sart_rule_html: '👉 看到 <strong>1、2、4、5、6、7、8、9</strong>，请<strong>立刻按空格键</strong>（或点击屏幕）<br>🚫 看到 <strong style="color:#dc2626;font-size:1.2rem">3</strong>，请<strong>不要按任何键</strong>',

    // SART 演示
    s_demo_h2: '演示与练习',
    s_demo_p: '观看下方演示，了解任务节奏：',
    demo_label: '演示',
    demo_press: '✓ 按下空格',
    demo_no: '✗ 不按（是 3！）',
    key_space: '空格',
    s_demo_hint: '先做 9 题练习，熟悉节奏后再进入正式测试。',
    btn_practice: '开始练习',

    // SART 测试
    sart_rule_short: '按空格 / 点击 = 非3 &nbsp;|&nbsp; 不按 = 3',
    alert_phone: '请回答全部问题后提交。',

    phase_practice: '练习',
    phase_pre: 'Pre-SART · 正式测试',
    phase_post: 'Post-SART · 正式测试',
    fb_correct_press: '✓ 正确 — 按空格',
    fb_correct_nogo: '✓ 正确 — 不按',
    fb_err_commission: '✗ 错误 — 见到 3 不应该按键',
    fb_err_omission: '✗ 错误 — 应该按空格',

    // 练习完成 → Pre-SART
    s_break_pre_h2: '练习完成！',
    s_break_pre_p1: '正式测试共 <strong>225 题</strong>，约需 4 分钟，规则完全相同。',
    s_break_pre_p2: '正式测试中<strong>不再显示对错提示</strong>，请保持专注。',
    btn_pre_sart: '开始正式测试',

    // 视频
    s_video_h2: '观看视频',
    s_video_p1: '接下来你将观看一段视频，请<strong>全程专注观看</strong>，不要切换页面或使用手机。',
    s_video_p2: '视频结束后会自动进入下一步。',
    video_duration_hint: '你将观看约 {m} 分钟的视频',
    btn_video_start: '开始观看',
    video_remaining: '剩余时间：',
    btn_video_skip: '⏭ 跳过（调试用）',

    // 情绪问卷
    s_mood_h2: '当前感受',
    s_mood_hint: '根据你刚才观看完视频后的真实感受作答。',
    mood_happy_label: '你现在有多幸福（happy）？',
    mood_sad_label: '你现在有多悲伤（sad）？',
    mood_energetic_label: '你现在有多兴奋/精力充沛（energetic）？',
    scale_not_happy: '完全不幸福',
    scale_very_happy: '非常幸福',
    scale_not_sad: '完全不悲伤',
    scale_very_sad: '非常悲伤',
    scale_not_energetic: '完全没有',
    scale_very_energetic: '非常兴奋',
    mood_tired_label: '你现在有多疲惫/困倦（tired）？',
    scale_not_tired: '完全不疲惫',
    scale_very_tired: '非常疲惫',
    video_interest_label: '你觉得这段视频有多有趣？',
    scale_not_interesting: '完全无聊',
    scale_very_interesting: '非常有趣',
    phone_tempted_label: '做实验期间，你有多想做分心的事（例如看手机）？',
    scale_not_tempted: '完全没有',
    scale_very_tempted: '非常想',
    phone_picked_label: '实验期间，你有没有做过分心的事（例如拿起手机）？',
    opt_yes: '有',
    opt_no: '没有',

    // Post-SART 过渡
    s_trans_h2: '第二轮注意力测试',
    s_trans_p1: '接下来是第二轮注意力测试，共 <strong>225 题</strong>，规则与之前完全相同。',
    s_trans_p2: '测试中<strong>不显示对错提示</strong>，请保持专注。',
    btn_post_sart: '开始测试',

    // 基本信息问卷
    s_demog_h2: '最后几个问题',
    s_demog_hint: '帮助我们更好地分析数据。',
    sm_hours_label: '你平均每天使用社交媒体（微信/微博/抖音/B站等）大约多少小时？',
    sm_type_label: '你使用社交媒体时，主要是哪种方式？',
    opt_less1h: '少于 1 小时',
    opt_1_2h: '1–2 小时',
    opt_2_3h: '2–3 小时',
    opt_3_4h: '3–4 小时',
    opt_4h_plus: '4 小时以上',
    opt_passive: '以浏览为主（看内容，很少发布）',
    opt_active: '以发布为主（发帖、评论、互动较多）',
    opt_both: '两者差不多',
    vg_hours_label: '你平均每天玩电子游戏大约多少小时？',
    opt_none: '不玩',
    opt_3h_plus: '3 小时以上',
    demog_age_label: '你的年龄',
    demog_age_ph: '例如：17',
    demog_gender_label: '你的性别',
    opt_male: '男',
    opt_female: '女',
    opt_nonbinary: '非二元',
    opt_prefer_not: '不愿透露',
    demog_location_label: '你目前所在的地区',
    opt_china: '中国',
    opt_us: '美国',
    opt_location_other: '其他',
    demog_email_label: '邮箱（可选）',
    demog_email_ph: '留下邮箱，论文发表后将结果发送给你',
    demog_email_hint: '此项为可选，不填不影响提交。',
    btn_submit: '提交',

    // 手机使用页
    s_phone_h2: '最后两个问题',
    s_phone_intro1: '在这么长的任务中（25 分钟以上），注意力出现分散是完全正常的现象。',
    s_phone_intro2: '无论你的答案是什么，<strong>你的诚实回答对我们的研究极其宝贵</strong>。感谢你的诚实！',

    // 完成页
    s_complete_h2: '实验完成，谢谢你！',
    s_complete_p: '你的数据已记录，对本研究非常有帮助。',
    score_title: '你的注意力表现',
    score_pre_label: '视频前（Pre-SART）',
    score_post_label: '视频后（Post-SART）',
    score_accuracy: '准确率',
    score_mean_rt: '平均反应时',
    score_errors: '误按次数',
    s_complete_id: '参与者编号：',

    // 验证提示
    alert_baseline: '请填写全部问题后继续。',
    alert_mood: '请完成全部问题后继续。',
    alert_demographics: '请至少填写社交媒体、游戏时长、年龄、性别和地区后提交。',
    group_label: '组',

    // 知情同意页
    s0_h1: '知情同意书',
    s0_researcher_label: '学生研究员：',
    s0_researcher: 'Zihe Meng',
    s0_title_label: '研究题目：',
    s0_title: '视频格式和观看时长如何影响注意力和情绪表现？',
    s0_purpose_label: '研究目的',
    s0_purpose: '研究视频格式（短视频 vs 长视频）和观看时长对后续注意力表现与主观情绪的影响。',
    s0_tasks_label: '参与内容',
    s0_tasks: '完成一项在线研究（约25分钟）：包括问卷、两项注意力测试，以及观看一段视频。',
    s0_time_label: '所需时间',
    s0_time: '约 25 分钟',
    s0_risks_label: '风险',
    s0_risks: '无预期风险。',
    s0_benefits_label: '研究意义',
    s0_benefits: '为注意力科学研究做出贡献。',
    s0_conf_label: '保密性',
    s0_conf: '所有数据匿名收集，不收集任何个人身份信息。',
    s0_voluntary: '参与本研究完全自愿。如果你不参与，不会有任何负面影响。参与后你可以随时停止，也可以选择不回答特定问题。',
    s0_contact_label: '如有疑问，请联系：',
    s0_contact_name: '（Lila Davachi 教授）',
    s0_agree_text: '我已阅读并理解以上信息，自愿同意参与本研究。',
    btn_consent: '同意并继续',
  },
  en: {
    pageTitle: 'Attention & Social Media Study',
    s1_h1: 'Attention & Social Media Study',
    s1_p1: 'Thank you for participating in this research!',
    s1_p2: 'This study includes: <strong>Attention Test → Watch a Video → Attention Test → Brief Survey</strong>, taking approximately 25–35 minutes.',
    s1_p3: 'Please complete this independently in a quiet environment. Do not use your phone or switch tabs during the study.',
    s1_hint: 'All data is stored anonymously and used for academic research only.',
    btn_start: "I'm ready — let's begin",

    s2_h2: 'Please sit comfortably',
    s2_p: 'Stay quiet and wait for the study to begin.',
    s2_hint: 'Will automatically proceed when the countdown ends',

    s3_h2: 'A few questions before we begin',
    s3_hint: 'These help us understand your current state. All fields are required.',
    bl_sleep_label: 'How many hours did you sleep last night?',
    bl_sleep_ph: 'e.g. 7',
    bl_activity_label: 'What were you mainly doing in the past 30 minutes?',
    opt_select: 'Please select',
    opt_resting: 'Resting / Relaxing',
    opt_studying: 'Attending class / Studying',
    opt_light: 'Light activity (walking, standing, etc.)',
    opt_exercise: 'Exercise / Sports',
    opt_other: 'Other',
    btn_continue: 'Continue',

    s_intro_h2: 'Attention Task Instructions',
    s_intro_p1: 'You will now complete an attention task. Numbers 1–9 will appear briefly one at a time at the center of the screen.',
    s_intro_p2: 'Please respond as quickly and accurately as possible. Each number appears only briefly.<br>⭕ After the number disappears, a circle with an ✕ (⊗) will appear to clear the afterimage of the previous number, preventing it from interfering with your next response. No action needed — just wait for the next number.',
    s_intro_hint: 'Please read the rules carefully. The next page will show a demo animation and practice.',
    sart_rule_html: '👉 When you see <strong>1, 2, 4, 5, 6, 7, 8, or 9</strong>, <strong>press the Space bar</strong> (or tap the screen)<br>🚫 When you see <strong style="color:#dc2626;font-size:1.2rem">3</strong>, do <strong>NOT press</strong> anything',

    s_demo_h2: 'Demo & Practice',
    s_demo_p: 'Watch the demo below to get a feel for the task:',
    demo_label: 'DEMO',
    demo_press: '✓ Press Space',
    demo_no: "✗ Don't press — it's 3!",
    key_space: 'SPACE',
    s_demo_hint: 'First, complete 9 practice trials to get the feel.',
    btn_practice: 'Start Practice',

    sart_rule_short: 'Space / Tap = not 3 &nbsp;|&nbsp; No press = 3',
    phase_practice: 'Practice',
    phase_pre: 'Pre-SART · Main Test',
    phase_post: 'Post-SART · Main Test',
    fb_correct_press: '✓ Correct — press Space',
    fb_correct_nogo: '✓ Correct — don\'t press',
    fb_err_commission: '✗ Wrong — do NOT press when you see 3',
    fb_err_omission: '✗ Wrong — you should have pressed Space',

    s_break_pre_h2: 'Practice Complete!',
    s_break_pre_p1: 'The main test has <strong>225 trials</strong> and takes about 4 minutes. Same rules apply.',
    s_break_pre_p2: '<strong>No feedback</strong> will be shown during the main test. Stay focused.',
    btn_pre_sart: 'Start Main Test',

    s_video_h2: 'Watch the Video',
    s_video_p1: 'You will watch a video next. Please <strong>watch attentively</strong> — do not switch tabs or use your phone.',
    s_video_p2: 'The study will automatically proceed after the video ends.',
    video_duration_hint: 'You will watch approximately {m} minutes of video',
    btn_video_start: 'Start Watching',
    video_remaining: 'Time remaining: ',
    btn_video_skip: '⏭ Skip (debug)',

    s_mood_h2: 'How Are You Feeling?',
    s_mood_hint: 'Please answer honestly based on how you feel right now, after watching the video.',
    mood_happy_label: 'How happy do you feel right now?',
    mood_sad_label: 'How sad do you feel right now?',
    mood_energetic_label: 'How energetic / excited do you feel right now?',
    scale_not_happy: 'Not at all',
    scale_very_happy: 'Very happy',
    scale_not_sad: 'Not at all',
    scale_very_sad: 'Very sad',
    scale_not_energetic: 'Not at all',
    scale_very_energetic: 'Very energetic',
    mood_tired_label: 'How tired or drained do you feel right now?',
    scale_not_tired: 'Not at all',
    scale_very_tired: 'Very tired',
    video_interest_label: 'How interesting did you find the video?',
    scale_not_interesting: 'Not at all interesting',
    scale_very_interesting: 'Very interesting',

    // Phone screen
    s_phone_h2: 'Two Last Questions',
    s_phone_intro1: 'It\'s completely normal for attention to wander during a long task like this — especially one lasting 25+ minutes.',
    s_phone_intro2: 'Whatever your answer is, <strong>your honest response is extremely valuable to our research</strong>. Thank you for your honesty!',
    phone_tempted_label: 'How often did you feel tempted to do something distracting (e.g., check your phone) during the study?',
    scale_not_tempted: 'Not at all',
    scale_very_tempted: 'Very frequently',
    phone_picked_label: 'Did you do anything distracting (e.g., pick up your phone) during the study?',
    opt_yes: 'Yes',
    opt_no: 'No',
    alert_phone: 'Please answer all questions before submitting.',

    s_trans_h2: 'Second Attention Test',
    s_trans_p1: 'Next is the second attention test — <strong>225 trials</strong>, same rules as before.',
    s_trans_p2: '<strong>No feedback</strong> will be shown. Stay focused.',
    btn_post_sart: 'Start Test',

    s_demog_h2: 'A Few Last Questions',
    s_demog_hint: 'These help us better analyze the data.',
    sm_hours_label: 'On average, how many hours per day do you use social media (Instagram, TikTok, YouTube, etc.)?',
    sm_type_label: 'When using social media, which best describes your usage?',
    opt_less1h: 'Less than 1 hour',
    opt_1_2h: '1–2 hours',
    opt_2_3h: '2–3 hours',
    opt_3_4h: '3–4 hours',
    opt_4h_plus: '4+ hours',
    opt_passive: 'Mostly passive (scrolling / watching, rarely posting)',
    opt_active: 'Mostly active (posting, commenting, engaging)',
    opt_both: 'Roughly equal',
    vg_hours_label: 'On average, how many hours per day do you play video games?',
    opt_none: 'None',
    opt_3h_plus: '3+ hours',
    demog_age_label: 'Your age',
    demog_age_ph: 'e.g. 17',
    demog_gender_label: 'Your gender',
    opt_male: 'Male',
    opt_female: 'Female',
    opt_nonbinary: 'Non-binary',
    opt_prefer_not: 'Prefer not to say',
    demog_location_label: 'Your current location',
    opt_china: 'China',
    opt_us: 'United States',
    opt_location_other: 'Other',
    demog_email_label: 'Email (optional)',
    demog_email_ph: 'Leave your email to receive the paper results',
    demog_email_hint: 'This field is optional.',
    btn_submit: 'Submit',

    s_complete_h2: 'Study Complete — Thank You!',
    s_complete_p: 'Your data has been recorded. Thank you for contributing to this research.',
    score_title: 'Your Attention Performance',
    score_pre_label: 'Before Video (Pre-SART)',
    score_post_label: 'After Video (Post-SART)',
    score_accuracy: 'Accuracy',
    score_mean_rt: 'Mean RT',
    score_errors: 'Commission Errors',
    s_complete_id: 'Participant ID: ',

    alert_baseline: 'Please answer all questions before continuing.',
    alert_mood: 'Please complete all questions before continuing.',
    alert_demographics: 'Please fill in social media, gaming, age, gender, and location before submitting.',
    group_label: 'Group ',

    // Informed consent
    s0_h1: 'Informed Consent',
    s0_researcher_label: 'Student Researcher:',
    s0_researcher: 'Zihe Meng',
    s0_title_label: 'Title of Project:',
    s0_title: 'How do video format and viewing duration affect subsequent attention performance and subjective mood?',
    s0_purpose_label: 'Purpose',
    s0_purpose: 'To study how video format (short-form vs. long-form) and viewing duration affect subsequent sustained attention performance and subjective mood.',
    s0_tasks_label: 'What you will do',
    s0_tasks: 'Complete an online study (~25 min): questionnaire, two attention tasks, and watching a short video.',
    s0_time_label: 'Time required',
    s0_time: '~25 minutes',
    s0_risks_label: 'Risks',
    s0_risks: 'None anticipated.',
    s0_benefits_label: 'Benefits',
    s0_benefits: 'Contributing to attention research.',
    s0_conf_label: 'Confidentiality',
    s0_conf: 'All data is collected anonymously. No personal identifying information is collected.',
    s0_voluntary: 'Participation in this study is completely voluntary. If you decide not to participate, there will not be any negative consequences. If you decide to participate, you may stop at any time and you may decide not to answer any specific question.',
    s0_contact_label: 'Questions? Contact:',
    s0_contact_name: '(Prof. Lila Davachi)',
    s0_agree_text: 'I have read and understand the above information and freely give my consent to participate in this research.',
    btn_consent: 'I agree — Continue',
  }
};

// ── 语言状态 ──────────────────────────────────────────
const LANG = { current: 'zh' };
let _debugNavBtns = [];

function T(key) {
  return TRANS[LANG.current][key] ?? TRANS.zh[key] ?? key;
}

function applyLang() {
  document.documentElement.lang = LANG.current === 'zh' ? 'zh-CN' : 'en';
  document.title = T('pageTitle');

  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = LANG.current === 'zh' ? 'EN' : '中文';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = T(el.dataset.i18n);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = T(el.dataset.i18nHtml);
    if (val) el.innerHTML = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = T(el.dataset.i18nPlaceholder);
    if (val) el.placeholder = val;
  });

  _debugNavBtns.forEach(({ btn, zh, en }) => {
    btn.textContent = LANG.current === 'zh' ? zh : en;
  });
}

// ── 语言切换按钮 ──────────────────────────────────────
document.getElementById('langToggle').addEventListener('click', () => {
  LANG.current = LANG.current === 'zh' ? 'en' : 'zh';
  applyLang();
  if (_demoTimer) { clearTimeout(_demoTimer); _startDemo(); }
});

applyLang();

// ── 屏幕管理 ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── Debug 导航面板（仅 CONFIG.debug = true 时显示）──────
if (CONFIG.debug) {
  const screens = [
    { id: 's-consent',         zh: '0 知情同意',      en: '0 Consent' },
    { id: 's-welcome',         zh: '1 欢迎',        en: '1 Welcome' },
    { id: 's-countdown',       zh: '2 倒计时',       en: '2 Countdown' },
    { id: 's-baseline',        zh: '3 基线问卷',      en: '3 Baseline' },
    { id: 's-sart-intro',      zh: '4 SART说明',     en: '4 SART Intro' },
    { id: 's-sart-demo',       zh: '5 演示+练习',     en: '5 Demo' },
    { id: 's-sart',            zh: '6 SART测试',     en: '6 SART Test' },
    { id: 's-sart-break-pre',  zh: '7 练习完→Pre',    en: '7 → Pre-SART' },
    { id: 's-video-intro',     zh: '8 视频说明',      en: '8 Video Intro' },
    { id: 's-video',           zh: '9 视频播放',      en: '9 Video' },
    { id: 's-mood',            zh: '10 情绪问卷',     en: '10 Mood' },
    { id: 's-sart-transition', zh: '11 →Post-SART',  en: '11 → Post' },
    { id: 's-demographics',    zh: '12 基本信息',     en: '12 Demographics' },
    { id: 's-phone',           zh: '13 手机使用',     en: '13 Phone' },
    { id: 's-complete',        zh: '14 完成',        en: '14 Complete' },
  ];

  const nav = document.createElement('div');
  nav.style.cssText = `
    position: fixed; top: 10px; right: 10px; z-index: 9999;
    background: rgba(0,0,0,0.8); border-radius: 8px;
    padding: 8px; display: flex; flex-direction: column; gap: 4px;
    font-size: 11px;
  `;

  // ── 分组选择器（面板顶部）──
  const groupRow = document.createElement('div');
  groupRow.style.cssText = 'display: flex; gap: 4px; margin-bottom: 4px;';

  [1, 2, 3, 4].forEach(g => {
    const btn = document.createElement('button');
    btn.textContent = `G${g}`;
    btn.id = `debug-group-btn-${g}`;
    btn.style.cssText = `
      background: #374151; color: #fff; border: none;
      border-radius: 4px; padding: 4px 8px; cursor: pointer;
      font-weight: bold; flex: 1;
    `;
    btn.addEventListener('click', () => {
      State.group = g;
      document.querySelectorAll('[id^="debug-group-btn-"]').forEach(b => {
        b.style.background = '#374151';
      });
      btn.style.background = '#16a34a';
    });
    groupRow.appendChild(btn);
  });

  nav.appendChild(groupRow);

  const sep = document.createElement('div');
  sep.style.cssText = 'border-top: 1px solid #4b5563; margin-bottom: 4px;';
  nav.appendChild(sep);

  screens.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = LANG.current === 'zh' ? s.zh : s.en;
    btn.style.cssText = `
      background: #374151; color: #fff; border: none;
      border-radius: 4px; padding: 4px 8px; cursor: pointer;
      text-align: left; white-space: nowrap;
    `;
    btn.addEventListener('click', () => showScreen(s.id));
    nav.appendChild(btn);
    _debugNavBtns.push({ btn, zh: s.zh, en: s.en });
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
function generateSartTrials(n) {
  const reps = n / 9;
  const pool = [];
  for (let d = 1; d <= 9; d++)
    for (let r = 0; r < reps; r++) pool.push(d);

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const T_NUM = CONFIG.sart.target;
  for (let i = 0; i < pool.length - 1; i++) {
    if (pool[i] === T_NUM && pool[i + 1] === T_NUM) {
      for (let j = i + 2; j < pool.length; j++) {
        if (pool[j] !== T_NUM) { [pool[i + 1], pool[j]] = [pool[j], pool[i + 1]]; break; }
      }
    }
  }
  return pool;
}

// ── SART 内部状态 ─────────────────────────────────────
const _sart = {
  trials:         [],
  index:          0,
  phase:          'practice',  // 'practice' | 'pre' | 'post'
  digitTimer:     null,
  maskTimer:      null,
  responseWindow: false,
  responded:      false,
  trialStart:     0,
  currentRt:      null,
};

// ── 视频计时器 ────────────────────────────────────────
let _videoTimer   = null;
let _videoEndedAC = null;   // AbortController for the video 'ended' listener

// ── 视频播放器 ────────────────────────────────────────
function _startVideo(groupCfg) {
  const frame  = document.getElementById('videoFrame');
  const player = document.getElementById('videoPlayer');

  if (groupCfg.type === 'local') {
    frame.style.display  = 'none';
    player.style.display = 'block';

    const playlist = [...groupCfg.src];
    let idx = 0;

    _videoEndedAC = new AbortController();

    const playNext = () => {
      if (idx < playlist.length) {
        player.src = playlist[idx++];
        player.play();
      }
      // 播放列表耗尽但计时器未结束：视频停止，计时器继续控制进入下一步
    };

    player.addEventListener('ended', playNext, { signal: _videoEndedAC.signal });
    playNext();

  } else {
    // YouTube iframe 路径（Groups 1 & 2）
    player.style.display = 'none';
    frame.style.display  = 'block';
    frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;
  }
}

function _stopVideo() {
  const frame  = document.getElementById('videoFrame');
  const player = document.getElementById('videoPlayer');

  // 停止 iframe
  frame.src = 'about:blank';
  frame.style.display = 'none';

  // 停止 video 并移除 ended 监听器
  if (_videoEndedAC) { _videoEndedAC.abort(); _videoEndedAC = null; }
  player.pause();
  player.src = '';
  player.style.display = 'none';
}

// ════════════════════════════════════════════════════════
//  SCREEN 0: 知情同意 → 欢迎
// ════════════════════════════════════════════════════════
const _consentCheckbox = document.getElementById('consent-checkbox');
const _btnConsent = document.getElementById('btn-consent');

_consentCheckbox.addEventListener('change', () => {
  _btnConsent.disabled = !_consentCheckbox.checked;
});

_btnConsent.addEventListener('click', () => {
  commitProgress('consent');
  showScreen('s-welcome');
});

// ════════════════════════════════════════════════════════
//  SCREEN 1 → 2: 欢迎 → 倒计时
// ════════════════════════════════════════════════════════
document.getElementById('btn-start').addEventListener('click', () => {
  commitProgress('welcome');
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
//  SCREEN 3: 基线问卷提交 → SART 说明（纯文字）
// ════════════════════════════════════════════════════════
document.getElementById('btn-baseline-submit').addEventListener('click', () => {
  const sleep           = document.getElementById('bl-sleep').value;
  const activity        = document.getElementById('bl-activity').value;
  const blMoodHappy     = document.querySelector('input[name="bl-mood-happy"]:checked')?.value;
  const blMoodSad       = document.querySelector('input[name="bl-mood-sad"]:checked')?.value;
  const blMoodEnergetic = document.querySelector('input[name="bl-mood-energetic"]:checked')?.value;
  const blMoodTired     = document.querySelector('input[name="bl-mood-tired"]:checked')?.value;

  if (!sleep || !activity || !blMoodHappy || !blMoodSad || !blMoodEnergetic || !blMoodTired) {
    alert(T('alert_baseline'));
    return;
  }

  State.baseline = {
    sleep:             +sleep,
    activity,
    bl_mood_happy:     +blMoodHappy,
    bl_mood_sad:       +blMoodSad,
    bl_mood_energetic: +blMoodEnergetic,
    bl_mood_tired:     +blMoodTired,
  };
  commitProgress('baseline');
  showScreen('s-sart-intro');
});

// ════════════════════════════════════════════════════════
//  SCREEN 4 → 5: SART 说明（文字）→ 演示+练习
// ════════════════════════════════════════════════════════
document.getElementById('btn-sart-next').addEventListener('click', () => {
  commitProgress('sart_intro');
  showScreen('s-sart-demo');
  _startDemo();
});

// ════════════════════════════════════════════════════════
//  SART 演示动画（含完整虚拟键盘）
// ════════════════════════════════════════════════════════
let _demoTimer = null;

function _startDemo() {
  if (_demoTimer) clearTimeout(_demoTimer);

  const seq = [4, 6, 3, 5, 3, 7];
  let i = 0;

  const digitEl    = document.getElementById('demoDigit');
  const maskEl     = document.getElementById('demoMask');
  const feedbackEl = document.getElementById('demoFeedback');
  const spaceEl    = document.getElementById('demoSpacebar');

  function reset() {
    digitEl.style.display = 'none';
    maskEl.style.display  = 'none';
    feedbackEl.textContent = '';
    feedbackEl.style.color = '';
    spaceEl.classList.remove('kb-go', 'kb-nogo');
  }

  function runStep() {
    reset();
    const num      = seq[i % seq.length];
    const isTarget = num === CONFIG.sart.target;
    const fontSize = CONFIG.sart.fontSizes[
      Math.floor(Math.random() * CONFIG.sart.fontSizes.length)
    ];

    digitEl.textContent    = num;
    digitEl.style.fontSize = fontSize + 'px';
    digitEl.style.color    = isTarget ? '#f87171' : '#fff';
    digitEl.style.display  = 'block';

    _demoTimer = setTimeout(() => {
      digitEl.style.display = 'none';
      maskEl.style.display  = 'flex';

      if (!isTarget) {
        spaceEl.classList.add('kb-go');
        feedbackEl.textContent = T('demo_press');
        feedbackEl.style.color = '#34d399';
      } else {
        spaceEl.classList.add('kb-nogo');
        feedbackEl.textContent = T('demo_no');
        feedbackEl.style.color = '#f87171';
      }

      _demoTimer = setTimeout(() => {
        i++;
        runStep();
      }, 1200);

    }, 800);
  }

  runStep();
}

// ════════════════════════════════════════════════════════
//  SCREEN 5 → 6: 演示页 → 练习（s-sart）
// ════════════════════════════════════════════════════════
document.getElementById('btn-sart-practice').addEventListener('click', () => {
  if (_demoTimer) { clearTimeout(_demoTimer); _demoTimer = null; }
  commitProgress('sart_demo');
  _sart.trials = generateSartTrials(CONFIG.sart.practiceTrials);
  _sart.index  = 0;
  _sart.phase  = 'practice';
  showScreen('s-sart');
  _runSartTrial();
});

// SCREEN 7 → 6: 练习完成 → Pre-SART
document.getElementById('btn-pre-sart').addEventListener('click', () => {
  commitProgress('pre_sart_start');
  _sart.trials = generateSartTrials(CONFIG.sart.mainTrials);
  _sart.index  = 0;
  _sart.phase  = 'pre';
  showScreen('s-sart');
  _runSartTrial();
});

// SCREEN 11 → 6: Post-SART 过渡 → Post-SART
document.getElementById('btn-post-sart').addEventListener('click', () => {
  commitProgress('post_sart_start');
  _sart.trials = generateSartTrials(CONFIG.sart.mainTrials);
  _sart.index  = 0;
  _sart.phase  = 'post';
  showScreen('s-sart');
  _runSartTrial();
});

// ════════════════════════════════════════════════════════
//  SART 核心引擎
// ════════════════════════════════════════════════════════
function _runSartTrial() {
  if (_sart.index >= _sart.trials.length) {
    if (_sart.phase === 'practice') {
      commitProgress('practice_done');
      showScreen('s-sart-break-pre');
    } else if (_sart.phase === 'pre') {
      // Pre-SART 完成 → 进入视频
      commitProgress('pre_sart');
      const groupCfg = CONFIG.videos[State.group];
      document.getElementById('video-group-hint').textContent =
        T('video_duration_hint').replace('{m}', groupCfg.durationSec / 60);
      showScreen('s-video-intro');
    } else {
      // Post-SART 完成 → 基本信息问卷
      commitProgress('post_sart');
      showScreen('s-demographics');
    }
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

  const phaseKey = _sart.phase === 'practice' ? 'phase_practice'
                 : _sart.phase === 'pre'      ? 'phase_pre'
                 :                               'phase_post';
  phaseEl.textContent = `${T(phaseKey)} · ${_sart.index + 1} / ${_sart.trials.length}`;
  feedbackEl.textContent = '';
  progressEl.textContent = '';

  _sart.responded      = false;
  _sart.currentRt      = null;
  _sart.responseWindow = false;

  maskEl.style.display   = 'none';
  digitEl.style.display  = 'block';
  digitEl.textContent    = num;
  digitEl.style.fontSize = fontSize + 'px';

  _sart.trialStart     = performance.now();
  _sart.responseWindow = true;

  _sart.digitTimer = setTimeout(() => {
    digitEl.style.display = 'none';
    maskEl.style.display  = 'flex';

    _sart.maskTimer = setTimeout(() => {
      _sart.responseWindow = false;
      maskEl.style.display = 'none';

      _recordTrial(num, isTarget, _sart.responded, _sart.currentRt);

      if (_sart.phase === 'practice') {
        const correct = isTarget ? !_sart.responded : _sart.responded;
        feedbackEl.textContent = correct
          ? (isTarget ? T('fb_correct_nogo') : T('fb_correct_press'))
          : (isTarget ? T('fb_err_commission') : T('fb_err_omission'));
        feedbackEl.className = correct ? 'fb-ok' : 'fb-err';
      }

      _sart.index++;
      setTimeout(_runSartTrial, _sart.phase === 'practice' ? 1200 : 0);

    }, _sart.phase === 'practice' ? CONFIG.sart.practiceMaskMs : CONFIG.sart.maskMs);
  }, _sart.phase === 'practice' ? CONFIG.sart.practiceDigitMs : CONFIG.sart.digitMs);
}

function _recordTrial(num, isTarget, responded, rt) {
  const type = isTarget
    ? (responded  ? 'commission_error'  : 'correct_inhibition')
    : (!responded ? 'omission_error'    : 'correct_response');

  const trialData = { num, isTarget, responded, rt, correct: (isTarget ? !responded : responded), type };

  if (_sart.phase === 'pre') {
    State.preSartTrials.push(trialData);
  } else if (_sart.phase === 'post') {
    State.postSartTrials.push(trialData);
  }
  // practice trials not recorded
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

// ════════════════════════════════════════════════════════
//  SCREEN 8 → 9: 视频说明 → 视频播放
// ════════════════════════════════════════════════════════
document.getElementById('btn-video-start').addEventListener('click', () => {
  commitProgress('video_start');
  showScreen('s-video');

  const groupCfg = CONFIG.videos[State.group];
  _startVideo(groupCfg);

  // 组别标签已移除（Lila 4/21 反馈：不向参与者展示分组信息）

  document.getElementById('btn-video-skip').style.display =
    CONFIG.debug ? 'block' : 'none';

  let remaining = groupCfg.durationSec;
  const timerEl = document.getElementById('videoTimer');
  const fillEl  = document.getElementById('videoProgressFill');
  timerEl.textContent = `${T('video_remaining')}${fmtTime(remaining)}`;

  _videoTimer = setInterval(() => {
    remaining--;
    timerEl.textContent = `${T('video_remaining')}${fmtTime(Math.max(0, remaining))}`;
    fillEl.style.width  = ((1 - remaining / groupCfg.durationSec) * 100) + '%';
    if (remaining <= 0) { clearInterval(_videoTimer); _afterVideo(); }
  }, 1000);
});

document.getElementById('btn-video-skip').addEventListener('click', () => {
  clearInterval(_videoTimer);
  _afterVideo();
});

function _afterVideo() {
  _stopVideo();
  commitProgress('video_done');
  showScreen('s-mood');
}

// ════════════════════════════════════════════════════════
//  SCREEN 10: 情绪问卷提交 → Post-SART 过渡
// ════════════════════════════════════════════════════════
document.getElementById('btn-mood-submit').addEventListener('click', () => {
  const videoInterest = document.querySelector('input[name="video-interest"]:checked')?.value;
  const happy         = document.querySelector('input[name="mood-happy"]:checked')?.value;
  const sad           = document.querySelector('input[name="mood-sad"]:checked')?.value;
  const energetic     = document.querySelector('input[name="mood-energetic"]:checked')?.value;
  const tired         = document.querySelector('input[name="mood-tired"]:checked')?.value;

  if (!videoInterest || !happy || !sad || !energetic || !tired) {
    alert(T('alert_mood'));
    return;
  }

  State.mood = {
    videoInterest: +videoInterest,
    happy:         +happy,
    sad:           +sad,
    energetic:     +energetic,
    tired:         +tired,
  };
  commitProgress('mood');
  showScreen('s-sart-transition');
});

// ════════════════════════════════════════════════════════
//  SCREEN 12: 基本信息问卷提交 → 完成
// ════════════════════════════════════════════════════════
document.getElementById('btn-demo-submit').addEventListener('click', () => {
  const smHours        = document.getElementById('sm-hours').value;
  const smType         = document.getElementById('sm-type').value;
  const videogameHours = document.getElementById('vg-hours').value;
  const age            = document.getElementById('demo-age').value;
  const gender         = document.getElementById('demo-gender').value;
  const location       = document.getElementById('demo-location').value;
  const email          = document.getElementById('demo-email').value.trim();

  if (!smHours || !smType || !videogameHours || !age || !gender || !location) {
    alert(T('alert_demographics'));
    return;
  }

  State.demographics = {
    smHours:        +smHours,
    smType,
    videogameHours: +videogameHours,
    age:            +age,
    gender,
    location,
    email:          email || null,
  };
  commitProgress('demographics');
  showScreen('s-phone');
});

// ════════════════════════════════════════════════════════
//  SCREEN 13: 手机使用提交 → 完成
// ════════════════════════════════════════════════════════
document.getElementById('btn-phone-submit').addEventListener('click', () => {
  const tempted = document.querySelector('input[name="phone-tempted"]:checked')?.value;
  const picked  = document.querySelector('input[name="phone-picked"]:checked')?.value;

  if (!tempted || !picked) {
    alert(T('alert_phone'));
    return;
  }

  State.phoneUse = { tempted: +tempted, picked };
  commitProgress('phone');
  showScreen('s-complete');
  submitData();
});
