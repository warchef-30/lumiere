# Lumiere SART 在线实验工具 · 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可通过 GitHub Pages 公开访问的在线心理学实验工具，实现视频观看 → 情绪问卷 → SART 注意力测试的完整流程，数据自动提交 Google Sheets。

**Architecture:** 纯静态前端（HTML + CSS + JS），无构建工具，无 ES modules。config.js 是唯一需要用户编辑的文件。Google Apps Script 作为数据收集后端。

**Tech Stack:** 原生 HTML5 / CSS3 / JavaScript (ES6)，YouTube iframe API，Google Apps Script，GitHub Pages

---

## 文件责任分工

| 文件 | 责任 |
|------|------|
| `code/config.js` | 所有可配置项：视频URL、SART参数、debug开关、sheetsUrl |
| `code/data.js` | 全局 State 对象 + submitData() 函数 |
| `code/experiment.js` | 所有实验逻辑（屏幕切换、倒计时、问卷、视频、SART） |
| `code/style.css` | 所有样式，响应式，移动端优先 |
| `code/index.html` | HTML 骨架，10个 screen div，按顺序引入 JS |
| `apps-script.js` | Google Apps Script 后端（不在 code/ 目录，单独部署） |
| `README.md` | 部署说明和上线 checklist |

**加载顺序（index.html 底部）：**
```html
<script src="config.js"></script>   <!-- 1. 配置（全局 CONFIG） -->
<script src="data.js"></script>     <!-- 2. 数据层（全局 State + submitData） -->
<script src="experiment.js"></script> <!-- 3. 实验逻辑（依赖 CONFIG 和 State） -->
```

---

## Task 1: 项目初始化 + config.js

**Files:**
- Create: `code/config.js`
- Create: `.gitignore`

- [ ] **Step 1: 初始化 git 仓库**

```bash
cd /Users/mengzihe/Desktop/高中/个人/Lumiere
git init
```

- [ ] **Step 2: 创建 .gitignore**

```
.DS_Store
*.log
```

- [ ] **Step 3: 创建 config.js**

```js
// ═══════════════════════════════════════════════════════
//  config.js  —  Lumiere SART 实验配置
//  这是唯一需要手动编辑的文件。
//  上线前需修改：debug → false，填入 sheetsUrl 和视频 URL。
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── 调试开关 ──────────────────────────────────────────
  // true  = 显示视频跳过按钮（本地调试用）
  // false = 隐藏跳过按钮（正式上线用）
  debug: true,

  // ── Google Sheets 提交地址 ────────────────────────────
  // 部署 apps-script.js 后，将生成的 Web App URL 填入此处
  sheetsUrl: 'YOUR_APPS_SCRIPT_URL_HERE',

  // ── 实验分组视频 ──────────────────────────────────────
  // url: YouTube embed 地址，格式 https://www.youtube.com/embed/视频ID
  // durationSec: 视频时长（秒）
  //
  // 占位符说明：
  //   组1/2 需要：竖屏短视频合集，内容轻松、节奏快（模拟刷短视频）
  //   组3/4 需要：横屏长视频，内容完整连贯（如纪录片、Vlog）
  //   可从 YouTube 搜索 "short video compilation" 或 "relaxing vlog" 获取 ID
  videos: {
    1: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
    2: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
    3: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 8  * 60 },
    4: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 16 * 60 },
  },

  // ── SART 参数（Robertson et al., 1997）────────────────
  sart: {
    digitMs:       250,                      // 数字呈现时长（ms）
    maskMs:        900,                      // circle-cross mask 时长（ms）
    fontSizes:     [48, 72, 94, 100, 120],   // 5种字号（px），每题随机选取
    target:        3,                        // no-go 数字（见到不按）
    practiceTrials: 18,                      // 练习题数（每个数字×2）
    mainTrials:    225,                      // 正式题数（每个数字×25）
  },

};
```

- [ ] **Step 4: 验证**

在浏览器控制台打开任意页面，输入：
```js
// 临时验证：在 HTML 文件里加 <script src="config.js"></script> 后刷新
console.log(CONFIG.sart.digitMs); // 预期输出: 250
console.log(Object.keys(CONFIG.videos).length); // 预期输出: 4
```

- [ ] **Step 5: 提交**

```bash
git add code/config.js .gitignore
git commit -m "feat: add project config"
```

---

## Task 2: data.js — 全局状态与数据提交

**Files:**
- Create: `code/data.js`

- [ ] **Step 1: 创建 data.js**

```js
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
  const trials   = State.sartTrials;
  const rtVals   = trials.filter(t => t.responded && t.rt !== null).map(t => t.rt);
  const meanRT   = rtVals.length
    ? Math.round(rtVals.reduce((a, v) => a + v, 0) / rtVals.length)
    : null;
  const sdRT     = rtVals.length > 1
    ? Math.round(Math.sqrt(
        rtVals.reduce((s, v) => s + Math.pow(v - meanRT, 2), 0) / rtVals.length
      ))
    : null;

  const payload = {
    participant_id:          State.participantId,
    timestamp:               new Date().toISOString(),
    group:                   State.group,
    group_label:             CONFIG.videos[State.group]
                               ? `组${State.group}` : '',
    bl_sleep:                State.baseline.sleep,
    bl_activity:             State.baseline.activity,
    bl_energy:               State.baseline.energy,
    bl_stress:               State.baseline.stress,
    mood_happy:              State.mood.happy,
    mood_sad:                State.mood.sad,
    sm_hours:                State.mood.smHours,
    sm_type:                 State.mood.smType,
    sart_commission_errors:  trials.filter(t => t.type === 'commission_error').length,
    sart_omission_errors:    trials.filter(t => t.type === 'omission_error').length,
    sart_mean_rt_ms:         meanRT,
    sart_sdrt_ms:            sdRT,
    tab_switched:            State.tabSwitched,
    sart_trials:             JSON.stringify(trials),
  };

  // 显示参与者编号（完成页使用）
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
```

- [ ] **Step 2: 验证（无需浏览器，检查逻辑）**

确认以下几点：
- `State.group` 一定在 1–4 之间：`Math.ceil(Math.random() * 4)` ✓
- `submitData()` 不依赖 DOM，只在最后一行更新 `completionId`（若存在）✓
- `no-cors` 模式适用于 Google Apps Script（无法读响应，但数据能写入）✓

- [ ] **Step 3: 提交**

```bash
git add code/data.js
git commit -m "feat: add global state and data submission"
```

---

## Task 3: apps-script.js — Google Sheets 后端

**Files:**
- Create: `apps-script.js`（根目录，不在 code/ 内，单独部署到 Google）

- [ ] **Step 1: 创建 apps-script.js**

```js
/**
 * Lumiere 实验数据收集 · Google Apps Script
 *
 * 部署步骤：
 * 1. 打开 Google Sheets，新建表格，命名为"Lumiere 实验数据"
 * 2. 菜单 → 扩展程序 → Apps Script
 * 3. 将此文件内容完整粘贴，替换原有内容
 * 4. 点击「部署」→「新建部署」
 *    - 类型：Web 应用
 *    - 执行身份：我（你的账号）
 *    - 访问权限：任何人
 * 5. 授权，复制生成的 Web App URL
 * 6. 将 URL 填入 code/config.js 的 sheetsUrl 字段
 */

const SHEET_NAME = 'responses';

const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label',
  'bl_sleep', 'bl_activity', 'bl_energy', 'bl_stress',
  'mood_happy', 'mood_sad', 'sm_hours', 'sm_type',
  'sart_commission_errors', 'sart_omission_errors',
  'sart_mean_rt_ms', 'sart_sdrt_ms',
  'tab_switched', 'sart_trials',
];

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow(HEADERS.map(k => (data[k] === undefined ? '' : data[k])));

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Lumiere experiment endpoint is live.');
}
```

- [ ] **Step 2: 提交**

```bash
git add apps-script.js
git commit -m "feat: add Google Apps Script backend"
```

---

## Task 4: style.css — 所有样式

**Files:**
- Create: `code/style.css`

- [ ] **Step 1: 创建 style.css**

```css
/* ═══════════════════════════════════════════════════════
   style.css  —  Lumiere SART 实验样式
   移动端优先，响应式布局
═══════════════════════════════════════════════════════ */

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
               'Hiragino Sans GB', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 24px 16px 48px;
  color: #1a1a1a;
}

/* ── 屏幕容器 ────────────────────────────────────────── */
.screen {
  display: none;
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
  text-align: center;
}
.screen.active { display: block; }

/* ── 字体层级 ────────────────────────────────────────── */
h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 12px; line-height: 1.3; }
h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 14px; }
p  { font-size: 0.95rem; line-height: 1.75; color: #444; margin-bottom: 12px; }
.hint { font-size: 0.82rem; color: #9ca3af; }

/* ── 按钮 ────────────────────────────────────────────── */
.btn {
  display: inline-block;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 13px 40px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 24px;
  transition: background 0.15s;
  min-width: 160px;
}
.btn:hover  { background: #1d4ed8; }
.btn:active { background: #1e40af; }

.btn-ghost {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.8rem;
  cursor: pointer;
  margin-top: 12px;
  text-decoration: underline;
  display: block;
  width: 100%;
}

/* ── 倒计时 ──────────────────────────────────────────── */
#countdownNumber {
  font-size: 6rem;
  font-weight: 800;
  color: #2563eb;
  line-height: 1;
  margin: 28px 0;
}

/* ── 问卷通用 ────────────────────────────────────────── */
.q-block { text-align: left; margin-bottom: 24px; }
.q-block > label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.q-block select,
.q-block input[type="number"] {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #f9fafb;
  outline: none;
  transition: border-color 0.15s;
}
.q-block select:focus,
.q-block input:focus { border-color: #2563eb; }

/* ── Likert 量表 ─────────────────────────────────────── */
.scale-row { display: flex; gap: 6px; margin-top: 8px; }
.scale-row label { flex: 1; cursor: pointer; }
.scale-row input[type="radio"] { display: none; }
.scale-row span {
  display: block;
  text-align: center;
  padding: 10px 0;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  background: #f9fafb;
  transition: all 0.12s;
}
.scale-row input:checked + span {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.scale-ends {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #9ca3af;
  margin-top: 4px;
}

/* ── 视频区域 ────────────────────────────────────────── */
.video-group-tag {
  display: inline-block;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.82rem;
  font-weight: 600;
  margin-bottom: 10px;
}
#videoBox {
  width: 100%;
  background: #0f0f0f;
  border-radius: 10px;
  overflow: hidden;
  margin: 16px 0 8px;
  position: relative;
  padding-top: 56.25%; /* 16:9 */
}
#videoBox iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
  pointer-events: none; /* 防止拖动进度条 */
}
#videoTimer {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
}
#videoProgressBar {
  width: 100%; height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 20px;
}
#videoProgressFill {
  height: 100%;
  background: #2563eb;
  width: 0%;
  transition: width 1s linear;
}

/* ── SART 屏幕 ───────────────────────────────────────── */
#s-sart {
  background: #0a0a0a;
  border-radius: 16px;
  padding: 32px 24px;
  min-height: 440px;
  display: none; /* 由 .screen.active 控制 */
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  color: #fff;
}
#s-sart.active { display: flex; }

#sartPhaseLabel {
  font-size: 0.75rem;
  color: #4b5563;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.sart-rule {
  font-size: 0.8rem;
  color: #374151;
  margin-top: 2px;
}

#sartStimulus {
  width: 240px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  /* 44px 最小点击区满足移动端无障碍标准 */
  min-width: 44px;
  min-height: 44px;
}

#sartDigit {
  font-weight: 800;
  color: #fff;
  line-height: 1;
  display: none;
}

#sartMask {
  display: none;
  width: 110px; height: 110px;
  border: 5px solid #fff;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 3rem;
  font-weight: 300;
}

#sartFeedback {
  font-size: 0.95rem;
  font-weight: 600;
  min-height: 20px;
}
.fb-ok  { color: #34d399; }
.fb-err { color: #f87171; }

#sartProgress { font-size: 0.75rem; color: #374151; }

/* ── 完成页 ──────────────────────────────────────────── */
.complete-icon { font-size: 3.5rem; margin-bottom: 14px; }
#completionId  { font-weight: 700; color: #2563eb; }

/* ── 响应式（手机） ──────────────────────────────────── */
@media (max-width: 480px) {
  body { padding: 12px 8px 32px; }
  .screen { padding: 28px 20px; border-radius: 12px; }
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1.1rem; }
  #countdownNumber { font-size: 4.5rem; }
  .btn { padding: 12px 28px; width: 100%; }
  #sartStimulus { width: 200px; height: 200px; }
}
```

- [ ] **Step 2: 视觉验证要点**（写完 index.html 后检查）

打开 `index.html`，依次检查：
- 白色卡片居中，背景灰色 ✓
- 按钮蓝色，hover 加深 ✓
- SART 屏幕黑色背景 ✓
- 手机模式（DevTools 切到 375px）：按钮全宽，字号缩小 ✓

- [ ] **Step 3: 提交**

```bash
git add code/style.css
git commit -m "feat: add responsive styles"
```

---

## Task 5: index.html — 页面骨架

**Files:**
- Create: `code/index.html`

- [ ] **Step 1: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注意力研究实验</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ══ SCREEN 1 · 欢迎 ══════════════════════════════ -->
<div class="screen active" id="s-welcome">
  <h1>注意力研究实验</h1>
  <p>感谢你参与本次研究！</p>
  <p>本实验共分三个部分：<strong>观看视频 → 情绪问卷 → 注意力任务</strong>，全程约 25–35 分钟。</p>
  <p>请在安静的环境中独立完成，中途不要使用手机或切换页面。</p>
  <p class="hint">所有数据匿名保存，仅用于学术研究。</p>
  <button class="btn" id="btn-start">我准备好了，开始</button>
</div>

<!-- ══ SCREEN 2 · 倒计时 ════════════════════════════ -->
<div class="screen" id="s-countdown">
  <h2>请放松坐好</h2>
  <p>保持安静，等待实验开始。</p>
  <div id="countdownNumber">10</div>
  <p class="hint">倒计时结束后自动进入下一步</p>
</div>

<!-- ══ SCREEN 3 · 基线问卷 ══════════════════════════ -->
<div class="screen" id="s-baseline">
  <h2>开始前的几个小问题</h2>
  <p class="hint" style="margin-bottom:20px">帮助我们了解你现在的状态，全部必填。</p>

  <div class="q-block">
    <label for="bl-sleep">昨晚你睡了几个小时？</label>
    <input type="number" id="bl-sleep" min="0" max="24" placeholder="例如：7">
  </div>

  <div class="q-block">
    <label for="bl-activity">过去 30 分钟你主要在做什么？</label>
    <select id="bl-activity">
      <option value="">请选择</option>
      <option value="resting">休息 / 放松</option>
      <option value="studying">上课 / 学习</option>
      <option value="light">轻度活动（散步、站立等）</option>
      <option value="exercise">运动 / 体育活动</option>
      <option value="other">其他</option>
    </select>
  </div>

  <div class="q-block">
    <label>你现在的精力水平如何？</label>
    <div class="scale-row">
      <label><input type="radio" name="bl-energy" value="1"><span>1</span></label>
      <label><input type="radio" name="bl-energy" value="2"><span>2</span></label>
      <label><input type="radio" name="bl-energy" value="3"><span>3</span></label>
      <label><input type="radio" name="bl-energy" value="4"><span>4</span></label>
      <label><input type="radio" name="bl-energy" value="5"><span>5</span></label>
    </div>
    <div class="scale-ends"><span>非常低</span><span>非常高</span></div>
  </div>

  <div class="q-block">
    <label>你现在的压力水平如何？</label>
    <div class="scale-row">
      <label><input type="radio" name="bl-stress" value="1"><span>1</span></label>
      <label><input type="radio" name="bl-stress" value="2"><span>2</span></label>
      <label><input type="radio" name="bl-stress" value="3"><span>3</span></label>
      <label><input type="radio" name="bl-stress" value="4"><span>4</span></label>
      <label><input type="radio" name="bl-stress" value="5"><span>5</span></label>
    </div>
    <div class="scale-ends"><span>非常低</span><span>非常高</span></div>
  </div>

  <button class="btn" id="btn-baseline-submit">继续</button>
</div>

<!-- ══ SCREEN 4 · 视频说明 ══════════════════════════ -->
<div class="screen" id="s-video-intro">
  <h2>第一部分：观看视频</h2>
  <p>接下来你将观看一段视频，请<strong>全程专注观看</strong>，不要切换页面或使用手机。</p>
  <p>视频结束后会自动进入下一步。</p>
  <p class="hint" id="video-group-hint"></p>
  <button class="btn" id="btn-video-start">开始观看</button>
</div>

<!-- ══ SCREEN 5 · 视频播放 ══════════════════════════ -->
<div class="screen" id="s-video">
  <span class="video-group-tag" id="video-group-tag"></span>
  <div id="videoBox">
    <iframe id="videoFrame" allowfullscreen
      allow="autoplay; encrypted-media"
      src="about:blank">
    </iframe>
  </div>
  <div id="videoTimer">剩余时间：-- : --</div>
  <div id="videoProgressBar"><div id="videoProgressFill"></div></div>
  <!-- debug 跳过按钮，由 experiment.js 根据 CONFIG.debug 控制显示 -->
  <button class="btn-ghost" id="btn-video-skip">⏭ 跳过（调试用）</button>
</div>

<!-- ══ SCREEN 6 · 情绪问卷 ══════════════════════════ -->
<div class="screen" id="s-mood">
  <h2>第二部分：当前感受</h2>
  <p class="hint" style="margin-bottom:20px">根据你刚才观看完视频后的真实感受作答。</p>

  <div class="q-block">
    <label>你现在有多幸福（happy）？</label>
    <div class="scale-row">
      <label><input type="radio" name="mood-happy" value="1"><span>1</span></label>
      <label><input type="radio" name="mood-happy" value="2"><span>2</span></label>
      <label><input type="radio" name="mood-happy" value="3"><span>3</span></label>
      <label><input type="radio" name="mood-happy" value="4"><span>4</span></label>
      <label><input type="radio" name="mood-happy" value="5"><span>5</span></label>
    </div>
    <div class="scale-ends"><span>完全不幸福</span><span>非常幸福</span></div>
  </div>

  <div class="q-block">
    <label>你现在有多悲伤（sad）？</label>
    <div class="scale-row">
      <label><input type="radio" name="mood-sad" value="1"><span>1</span></label>
      <label><input type="radio" name="mood-sad" value="2"><span>2</span></label>
      <label><input type="radio" name="mood-sad" value="3"><span>3</span></label>
      <label><input type="radio" name="mood-sad" value="4"><span>4</span></label>
      <label><input type="radio" name="mood-sad" value="5"><span>5</span></label>
    </div>
    <div class="scale-ends"><span>完全不悲伤</span><span>非常悲伤</span></div>
  </div>

  <div class="q-block">
    <label for="sm-hours">你平均每天使用社交媒体（微信/微博/抖音/B站等）大约多少小时？</label>
    <select id="sm-hours">
      <option value="">请选择</option>
      <option value="0">少于 1 小时</option>
      <option value="1">1–2 小时</option>
      <option value="2">2–3 小时</option>
      <option value="3">3–4 小时</option>
      <option value="4">4 小时以上</option>
    </select>
  </div>

  <div class="q-block">
    <label for="sm-type">你使用社交媒体时，主要是哪种方式？</label>
    <select id="sm-type">
      <option value="">请选择</option>
      <option value="passive">以浏览为主（看内容，很少发布）</option>
      <option value="active">以发布为主（发帖、评论、互动较多）</option>
      <option value="both">两者差不多</option>
    </select>
  </div>

  <button class="btn" id="btn-mood-submit">继续</button>
</div>

<!-- ══ SCREEN 7 · SART 说明 ═════════════════════════ -->
<div class="screen" id="s-sart-intro">
  <h2>第三部分：注意力任务</h2>
  <p>屏幕上会快速出现数字 <strong>1 到 9</strong>，每个数字只显示约 <strong>0.25 秒</strong>。</p>
  <p>
    👉 看到 <strong>1、2、4、5、6、7、8、9</strong>，请<strong>立刻按空格键</strong>（或点击屏幕）<br>
    🚫 看到 <strong style="color:#dc2626;font-size:1.2rem">3</strong>，请<strong>不要按任何键</strong>
  </p>
  <p>数字消失得很快，反应要尽量<strong>又快又准</strong>。</p>
  <p class="hint">先做 18 题练习，熟悉节奏后再进入正式测试（225 题，约 4 分钟）。</p>
  <button class="btn" id="btn-sart-practice">开始练习</button>
</div>

<!-- ══ SCREEN 8 · SART 测试（练习 & 正式共用）═══════ -->
<div class="screen" id="s-sart">
  <div id="sartPhaseLabel"></div>
  <div class="sart-rule">按空格 / 点击 = 非3 &nbsp;|&nbsp; 不按 = 3</div>
  <div id="sartStimulus">
    <span id="sartDigit"></span>
    <div id="sartMask">✕</div>
  </div>
  <div id="sartFeedback"></div>
  <div id="sartProgress"></div>
</div>

<!-- ══ SCREEN 9 · 练习完成 ══════════════════════════ -->
<div class="screen" id="s-sart-break">
  <h2>练习完成！</h2>
  <p>正式测试共 <strong>225 题</strong>，约需 4 分钟，规则完全相同。</p>
  <p>正式测试中<strong>不再显示对错提示</strong>，请保持专注。</p>
  <button class="btn" id="btn-sart-main">开始正式测试</button>
</div>

<!-- ══ SCREEN 10 · 完成 ══════════════════════════════ -->
<div class="screen" id="s-complete">
  <div class="complete-icon">🎉</div>
  <h2>实验完成，谢谢你！</h2>
  <p>你的数据已记录，对本研究非常有帮助。</p>
  <p class="hint">参与者编号：<span id="completionId"></span></p>
</div>

<!-- 按顺序加载：config → data → experiment -->
<script src="config.js"></script>
<script src="data.js"></script>
<script src="experiment.js"></script>
</body>
</html>
```

- [ ] **Step 2: 在浏览器里打开验证**

```bash
open code/index.html
```

预期：欢迎页显示，白色卡片居中，蓝色按钮可见。控制台无报错（experiment.js 还不存在会报错，属正常）。

- [ ] **Step 3: 提交**

```bash
git add code/index.html
git commit -m "feat: add HTML skeleton with 10 screens"
```

---

## Task 6: experiment.js — 完整实验逻辑

**Files:**
- Create: `code/experiment.js`

- [ ] **Step 1: 创建 experiment.js**

```js
// ═══════════════════════════════════════════════════════
//  experiment.js  —  Lumiere SART 实验主逻辑
//  依赖：CONFIG（config.js）、State + submitData（data.js）
// ═══════════════════════════════════════════════════════

// ── 屏幕管理 ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
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

  // 修复连续目标数字（最少间隔1个非目标）
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
  trials:        [],
  index:         0,
  isPractice:    true,
  digitTimer:    null,
  maskTimer:     null,
  responseWindow: false,
  responded:     false,
  trialStart:    0,
  currentRt:     null,
};

// ── 视频内部状态 ──────────────────────────────────────
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

  // 在视频说明页提示组别
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

  // 设置 iframe
  const frame = document.getElementById('videoFrame');
  // autoplay=1, controls=0, disablekb=1, rel=0, modestbranding=1
  frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;

  document.getElementById('video-group-tag').textContent = `组${State.group}`;

  // 显示/隐藏跳过按钮
  const skipBtn = document.getElementById('btn-video-skip');
  skipBtn.style.display = CONFIG.debug ? 'block' : 'none';

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
  // 停止视频
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

  // Phase 1: 显示数字（250ms）
  maskEl.style.display  = 'none';
  digitEl.style.display = 'block';
  digitEl.textContent   = num;
  digitEl.style.fontSize = fontSize + 'px';

  _sart.trialStart     = performance.now();
  _sart.responseWindow = true;

  _sart.digitTimer = setTimeout(() => {
    // Phase 2: 显示 mask（900ms）
    digitEl.style.display = 'none';
    maskEl.style.display  = 'flex';

    _sart.maskTimer = setTimeout(() => {
      _sart.responseWindow = false;
      maskEl.style.display = 'none';

      // 记录本题
      _recordTrial(num, isTarget, _sart.responded, _sart.currentRt);

      // 练习阶段显示反馈
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

// ── 响应处理：空格键 + 点击 ───────────────────────────
function _handleResponse() {
  if (!_sart.responseWindow || _sart.responded) return;
  _sart.responded = true;
  _sart.currentRt = performance.now() - _sart.trialStart;
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space') { e.preventDefault(); _handleResponse(); }
});
document.getElementById('sartStimulus').addEventListener('click', _handleResponse);
```

- [ ] **Step 2: 端到端手动验证**

```bash
open code/index.html
```

按以下路径测试（使用调试模式，跳过视频）：

1. 点击「我准备好了，开始」→ 出现倒计时10秒 ✓
2. 倒计时结束 → 出现基线问卷 ✓
3. 不填写直接点继续 → 提示「请填写全部问题」 ✓
4. 填写全部 → 出现视频说明 ✓
5. 点「开始观看」→ 出现视频页，有「⏭ 跳过」按钮（debug=true） ✓
6. 点跳过 → 出现情绪问卷 ✓
7. 填写情绪问卷 → 出现 SART 说明 ✓
8. 点「开始练习」→ SART 黑屏，出现数字 ✓
9. 按空格响应，练习18题后 → 练习完成页 ✓
10. 点「开始正式测试」→ 225题，无反馈 ✓
11. 225题完成 → 完成页，控制台打印数据（sheetsUrl 未配置时）✓

- [ ] **Step 3: 提交**

```bash
git add code/experiment.js
git commit -m "feat: add complete experiment logic with SART engine"
```

---

## Task 7: README.md + GitHub Pages 部署

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
# Lumiere SART 实验工具

视频格式与注意力研究 · 在线实验工具

## 快速开始（本地测试）

直接用浏览器打开 `code/index.html` 即可。无需安装任何依赖。

## 上线前必做

编辑 `code/config.js`，完成以下三项：

### 1. 填入视频 URL

找到 `videos` 字段，替换每组的 YouTube embed URL：
- 组1/2：短视频合集（搜索 "YouTube Shorts compilation"，取视频ID）
- 组3/4：长视频（搜索 "relaxing documentary"，取视频ID）

YouTube embed URL 格式：`https://www.youtube.com/embed/视频ID`

### 2. 部署 Google Apps Script

1. 打开 Google Sheets，新建表格
2. 菜单 → 扩展程序 → Apps Script
3. 将 `apps-script.js` 内容粘贴进去
4. 部署 → 新建部署 → 类型：Web 应用 → 访问：任何人
5. 复制生成的 URL，填入 `config.js` 的 `sheetsUrl`

### 3. 关闭调试模式

将 `config.js` 中 `debug: true` 改为 `debug: false`

## 部署到 GitHub Pages

```bash
# 1. 在 GitHub 创建新仓库（如 lumiere-sart）
# 2. 推送代码
git remote add origin https://github.com/你的用户名/lumiere-sart.git
git branch -M main
git push -u origin main

# 3. 在 GitHub 仓库页面：Settings → Pages → 
#    Source: Deploy from a branch → Branch: main / root
# 4. 等待约1分钟，访问：https://你的用户名.github.io/lumiere-sart/code/
```

## 数据说明

每位参与者完成后，数据自动写入 Google Sheets 一行，包含：
- 基线信息（睡眠、精力、压力）
- 情绪问卷结果（happy/sad 各1-5分）
- 社交媒体使用习惯
- SART 指标：commission errors、omission errors、mean RT、SD RT
- 每题原始数据（JSON）

分析建议：以 mean RT 为协变量做 ANCOVA，控制速度-准确性权衡效应。
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: add deployment README"
```

- [ ] **Step 3: 推送到 GitHub Pages**

在 GitHub 创建仓库 `lumiere-sart`，然后：

```bash
git remote add origin https://github.com/你的用户名/lumiere-sart.git
git branch -M main
git push -u origin main
```

GitHub 仓库 → Settings → Pages → Source: main / root → Save

等约1分钟后，访问 `https://你的用户名.github.io/lumiere-sart/code/` 验证页面可访问。

---

## Self-Review（自检）

**Spec coverage 检查：**
- [x] 10个屏幕全部实现（Task 5 index.html）
- [x] 4组随机分配（Task 2 data.js）
- [x] YouTube iframe embed + controls=0 + disablekb=1（Task 6）
- [x] debug 跳过按钮（Task 6）
- [x] SART Robertson 1997 参数（Task 1 config.js + Task 6）
- [x] 序列约束：目标数字不连续（Task 6 generateSartTrials）
- [x] 空格 + 点击双响应（Task 6）
- [x] 全部问卷字段必填验证（Task 6）
- [x] tab_switched 检测（Task 2）
- [x] Google Sheets 提交（Task 3 + Task 2）
- [x] 响应式移动端（Task 4）
- [x] GitHub Pages 部署（Task 7）
- [x] 上线 checklist（Task 7 README）

**Placeholder scan：** 无 TBD/TODO，视频URL为有意义的占位（README 有替换说明）✓

**Type consistency：** CONFIG.sart、CONFIG.videos、State.baseline、State.mood、State.sartTrials 在所有文件中命名一致 ✓
