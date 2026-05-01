# Lumiere SART 实验网站完成计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 填入4组视频配置、同步 Apps Script schema、完成 GitHub Pages 部署，使实验网站可供参与者正式访问。

**Architecture:** 静态 HTML/JS/CSS 托管在 GitHub Pages（`code/` 子目录），视频文件直接提交到同一 repo（均 < 100MB），Google Apps Script 接收数据写入 Sheets。

**Tech Stack:** Vanilla JS, GitHub Pages, Google Apps Script, Git

---

## 背景知识（开始前必读）

**文件结构（相对于 repo 根目录）：**
```
Lumiere/
  code/           ← GitHub Pages 服务的网站代码
    index.html
    config.js     ← 唯一需要手动配置的文件
    experiment.js
    data.js
    style.css
  videos/
    long/
      FermiParadox-6min.mp4   (380s = 6.3min)
      SubwaySurfurs-13min.mp4 (813s = 13.6min)
      AllNukesAtOnce-7min.mp4 (不再使用)
      NukeACity-9min.mp4      (不再使用)
    short/
      s01.mp4 ~ s20.mp4       (重命名后，原始文件名含 emoji/特殊字符)
  apps-script.js  ← 粘贴到 Google Apps Script 的服务端代码
```

**实验4组设计：**
| 组 | 视频类型 | 时长条件 | 实际视频 | durationSec |
|----|----------|----------|----------|-------------|
| 1 | YouTube Shorts | ~7min | s01–s10，播放列表自然结束 | 363 |
| 2 | YouTube Shorts | ~14min | s01–s20，播放列表自然结束 | 826 |
| 3 | 长视频 | ~7min | FermiParadox (380s) | 380 |
| 4 | 长视频 | ~14min | SubwaySurfurs (813s) | 813 |

**注意：** 条件标签从 8/16 改为 7/14，更接近实际视频时长（约6min/14min）。不使用计时器截断——所有播放列表均自然结束。RQ 中的时长表述（"8 vs. 16 minutes"→"7 vs. 14 minutes"）等 4/18 会议 Lila 确认后更新论文。

**短视频重命名映射（glob展开顺序 = 系统排序）：**
```
s01 ← 소리를 확인하지 마세요 😭😭_720p.mp4              (35s)
s02 ← 2YO Ring Bearer's Delivery Chaos...😂_720p.mp4   (14s)
s03 ← Doing good feels good—try it!🥰🙌..._720p (1).mp4 (48s)
s04 ← Gun Snatch Drill😂🤯💀_720p.mp4                  (30s)
s05 ← Insane SALT MAGIC Trick 🤯🧂 #shorts_720p.mp4    (14s)
s06 ← Kondisi tekini mushola..._720p.mp4                (66s)
s07 ← Mirror #fyp #mirror #imitation #funny_720p.mp4   (47s)
s08 ← My Son Copies Everything I Do #shorts_720p (1).mp4 (24s)
s09 ← No ice over the Years 🧊 ❌ #usa_720p.mp4        (26s)
s10 ← Normal Self Defense vs Real-Life...💥_720p (1).mp4 (59s)
s11 ← Normal skill Vs King of Haircuts🗿_720p.mp4       (51s)
s12 ← Orange Candle Hack 😋. #usa_720p.mp4              (58s)
s13 ← Parents with kids #kid..._720p.mp4                (46s)
s14 ← Ranking Funniest Harmless Dad Pranks_720p.mp4     (44s)
s15 ← she is smart😎😂 #ishowspeed#edit_720p.mp4        (28s)
s16 ← Soldiers coming home..._720p (1).mp4              (54s)
s17 ← The art of cheating The Under-Gifted..._720p.mp4  (60s)
s18 ← Things we Did as Kids 🧒 👧. #usa_720p.mp4       (44s)
s19 ← This Looks TERRIFYING 🫣_720p (1).mp4             (46s)
s20 ← What really happens when you charge your phone…_720p (1).mp4 (32s)
```
合计: 826s ≈ 13.8min

---

## Task 1: 重命名短视频文件

**Files:**
- Rename: `videos/short/*.mp4` → `videos/short/s01.mp4` … `s20.mp4`

- [ ] **Step 1: 执行重命名脚本**

在 `~/Desktop/高中/个人/Lumiere` 目录下运行：

```bash
cd ~/Desktop/高中/个人/Lumiere/videos/short
i=1
for f in *.mp4; do
  new=$(printf "s%02d.mp4" $i)
  mv "$f" "$new"
  i=$((i+1))
done
ls -1 *.mp4
```

预期输出：
```
s01.mp4
s02.mp4
...
s20.mp4
```

- [ ] **Step 2: 验证数量**

```bash
ls ~/Desktop/高中/个人/Lumiere/videos/short/*.mp4 | wc -l
```

预期输出：`20`

---

## Task 2: 更新 config.js

**Files:**
- Modify: `code/config.js`

- [ ] **Step 1: 用以下内容完整替换 `code/config.js`**

```js
// ═══════════════════════════════════════════════════════
//  config.js  —  Lumiere SART 实验配置
//  这是唯一需要手动编辑的文件。
//  上线前需修改：debug → false，填入 sheetsUrl。
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── 调试开关 ──────────────────────────────────────────
  debug: true,  // 上线前改为 false

  // ── Google Sheets 提交地址 ────────────────────────────
  // 部署 apps-script.js 后将 Web App URL 填入此处
  sheetsUrl: 'YOUR_APPS_SCRIPT_URL_HERE',

  // ── 实验分组视频 ──────────────────────────────────────
  // 所有组 durationSec = 实际视频总时长，播放列表自然结束，无截断
  // 组1: s01–s10（10条，363s ≈ 7min 条件）
  // 组2: s01–s20（20条，826s ≈ 14min 条件）
  // 组3: Fermi Paradox（380s ≈ 7min 条件）
  // 组4: Subway Surfers AI（813s ≈ 14min 条件）
  videos: {
    1: {
      type: 'local',
      src: [
        '../videos/short/s01.mp4', '../videos/short/s02.mp4',
        '../videos/short/s03.mp4', '../videos/short/s04.mp4',
        '../videos/short/s05.mp4', '../videos/short/s06.mp4',
        '../videos/short/s07.mp4', '../videos/short/s08.mp4',
        '../videos/short/s09.mp4', '../videos/short/s10.mp4',
      ],
      durationSec: 363,  // 7-min condition: 10 shorts, natural end (363s actual)
    },
    2: {
      type: 'local',
      src: [
        '../videos/short/s01.mp4', '../videos/short/s02.mp4',
        '../videos/short/s03.mp4', '../videos/short/s04.mp4',
        '../videos/short/s05.mp4', '../videos/short/s06.mp4',
        '../videos/short/s07.mp4', '../videos/short/s08.mp4',
        '../videos/short/s09.mp4', '../videos/short/s10.mp4',
        '../videos/short/s11.mp4', '../videos/short/s12.mp4',
        '../videos/short/s13.mp4', '../videos/short/s14.mp4',
        '../videos/short/s15.mp4', '../videos/short/s16.mp4',
        '../videos/short/s17.mp4', '../videos/short/s18.mp4',
        '../videos/short/s19.mp4', '../videos/short/s20.mp4',
      ],
      durationSec: 826,  // 14-min condition: 20 shorts, natural end (826s actual)
    },
    3: {
      type: 'local',
      src: ['../videos/long/FermiParadox-6min.mp4'],
      durationSec: 380,  // 7-min condition: Fermi Paradox (380s actual)
    },
    4: {
      type: 'local',
      src: ['../videos/long/SubwaySurfurs-13min.mp4'],
      durationSec: 813,  // 14-min condition: Subway Surfers AI (813s actual)
    },
  },

  // ── SART 参数（Robertson et al., 1997）──────────────────
  sart: {
    digitMs:         250,
    maskMs:          900,
    practiceDigitMs: 800,
    practiceMaskMs:  1000,
    fontSizes:       [48, 72, 94, 100, 120],
    target:          3,
    practiceTrials:  9,
    mainTrials:      225,
  },

};
```

- [ ] **Step 2: 验证文件已保存**

```bash
grep "durationSec: 363" ~/Desktop/高中/个人/Lumiere/code/config.js
grep "durationSec: 813" ~/Desktop/高中/个人/Lumiere/code/config.js
```

预期：两条 grep 各返回一行匹配结果。

---

## Task 3: 更新 apps-script.js HEADERS

**Files:**
- Modify: `apps-script.js`（repo 根目录）

当前 HEADERS 是 v1.0 旧版（单次 SART，缺 pre/post 区分、mood_energetic、demographics）。需同步至与 `data.js` payload 完全一致。

- [ ] **Step 1: 替换 HEADERS 数组**

将 `apps-script.js` 中的 HEADERS 从：
```js
const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label',
  'bl_sleep', 'bl_activity', 'bl_energy', 'bl_stress',
  'mood_happy', 'mood_sad', 'sm_hours', 'sm_type',
  'sart_commission_errors', 'sart_omission_errors',
  'sart_mean_rt_ms', 'sart_sdrt_ms',
  'tab_switched', 'sart_trials',
];
```

替换为：
```js
const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label',
  'bl_sleep', 'bl_activity', 'bl_energy', 'bl_stress',
  'mood_happy', 'mood_sad', 'mood_energetic',
  'pre_sart_commission_errors', 'pre_sart_omission_errors',
  'pre_sart_mean_rt_ms', 'pre_sart_sdrt_ms',
  'post_sart_commission_errors', 'post_sart_omission_errors',
  'post_sart_mean_rt_ms', 'post_sart_sdrt_ms',
  'sm_hours', 'sm_type', 'videogame_hours',
  'age', 'gender', 'location', 'email',
  'tab_switched', 'pre_sart_trials', 'post_sart_trials',
];
```

- [ ] **Step 2: 验证**

```bash
grep "mood_energetic" ~/Desktop/高中/个人/Lumiere/apps-script.js
grep "pre_sart_commission_errors" ~/Desktop/高中/个人/Lumiere/apps-script.js
```

预期：两条各返回一行。

---

## Task 4: 本地端到端测试

**Files:** 无需改动，验证步骤

- [ ] **Step 1: 在浏览器打开实验页面**

在 Terminal 运行（用 Python 起本地服务器，解决视频跨域问题）：

```bash
cd ~/Desktop/高中/个人/Lumiere && python3 -m http.server 8080
```

然后在浏览器打开：`http://localhost:8080/code/`

- [ ] **Step 2: 测试 debug 导航面板**

确认右上角有 debug 面板，包含 G1/G2/G3/G4 按钮和14个屏幕跳转按钮。

- [ ] **Step 3: 测试组3视频（最快验证）**

1. 点击 debug 面板中 `G3`（按钮变绿）
2. 点击 `8 视频说明`，确认页面提示"约 6 分钟"
3. 点击 `9 视频播放`，确认 FermiParadox 视频开始播放，进度条运作
4. 点击 `⏭ 跳过`，确认跳转到 `10 情绪问卷`

- [ ] **Step 4: 测试组1短视频**

1. 刷新页面（重置状态）
2. 点击 `G1`，点击 `9 视频播放`
3. 确认 s01.mp4 开始播放，播放结束后自动切到 s02.mp4
4. 点击 `⏭ 跳过`

- [ ] **Step 5: 测试完整流程（组4）**

1. 刷新，点击 `G4`
2. 从 `0 知情同意` 开始走完整流程（勾 checkbox → 继续 → 填基线问卷 → SART 说明 → 演示 → 练习9题 → Pre-SART 用 skip 跳过 → 视频跳过 → 填情绪问卷 → Post-SART 跳过 → 填 demographics → 提交）
3. 确认最终页显示参与者编号和 Pre/Post 分数卡

预期：完成页出现，控制台输出 `📊 实验数据（未配置提交 URL）: {...}` 并显示所有字段

- [ ] **Step 6: 停止本地服务器**

按 `Ctrl+C` 终止 python3 进程。

---

## Task 5: 部署 Google Apps Script

**Files:**
- Read: `apps-script.js`（内容已在 Task 3 更新）
- Modify: `code/config.js`（填入 sheetsUrl）

- [ ] **Step 1: 创建 Google Sheets**

1. 打开 [sheets.google.com](https://sheets.google.com)，新建表格
2. 命名为 `Lumiere 实验数据`

- [ ] **Step 2: 打开 Apps Script 编辑器**

表格菜单 → `扩展程序` → `Apps Script`

- [ ] **Step 3: 粘贴代码**

删除编辑器默认内容，粘贴 `apps-script.js` 的完整内容，点击 `保存`（💾 或 Ctrl+S）。

- [ ] **Step 4: 部署为 Web 应用**

1. 右上角 `部署` → `新建部署`
2. 类型：`Web 应用`
3. 执行身份：`我（你的账号）`
4. 访问权限：`任何人`
5. 点击 `部署`，授权，复制生成的 Web App URL（格式：`https://script.google.com/macros/s/AK.../exec`）

- [ ] **Step 5: 将 URL 填入 config.js**

将 `code/config.js` 中：
```js
sheetsUrl: 'YOUR_APPS_SCRIPT_URL_HERE',
```
替换为：
```js
sheetsUrl: 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec',
```

同时将 `debug` 改为 `false`：
```js
debug: false,
```

- [ ] **Step 6: 验证数据提交**

1. 用 Python 服务器再次打开 `http://localhost:8080/code/`
2. 走完整流程，提交
3. 打开 Google Sheets，确认 `responses` sheet 中出现一行新数据
4. 验证列名与 HEADERS 一致（29列）

---

## Task 6: GitHub Pages 部署

**Files:**
- New: `.gitignore`
- Git operations on repo at `~/Desktop/高中/个人/Lumiere`

**前提：** Task 1-5 全部完成，视频已重命名，config.js 填入真实 sheetsUrl，debug: false。

- [ ] **Step 1: 创建 `.gitignore`**

在 `~/Desktop/高中/个人/Lumiere/` 新建 `.gitignore`：

```
# 不再使用的旧视频
videos/long/AllNukesAtOnce-7min.mp4
videos/long/NukeACity-9min.mp4

# macOS 系统文件
.DS_Store

# 个人文件（不入 repo）
9700付款记录.png
Davachi_CV_110224.pdf
IRB approval form.pdf
IRB-Guide.pdf
Lumiere - How Admissions Officers Evaluate Research Projects.pdf
Lumiere_Publication-Syllabus.pdf
week1/
week2/
week3/
week3 reading.pdf
week4/
week5/
week6/
week7/
Lumiere导师匹配分析.md
```

- [ ] **Step 2: 在 GitHub 创建新 repo**

1. 打开 [github.com/new](https://github.com/new)
2. Repository name: `lumiere-attention-study`
3. Visibility: **Private**（研究数据保护）
4. 不勾选任何初始化选项（repo 已有内容）
5. 点击 `Create repository`，复制 repo URL

- [ ] **Step 3: 添加 remote 并配置**

```bash
cd ~/Desktop/高中/个人/Lumiere
git remote add origin https://github.com/warchef/lumiere-attention-study.git
```

验证：
```bash
git remote -v
```
预期：显示 origin 的 fetch/push URL。

- [ ] **Step 4: Stage 所有需要的文件**

```bash
cd ~/Desktop/高中/个人/Lumiere
git add code/
git add videos/short/
git add videos/long/FermiParadox-6min.mp4
git add videos/long/SubwaySurfurs-13min.mp4
git add apps-script.js
git add README.md
git add .gitignore
git add docs/
git status
```

确认：
- 没有 `AllNukesAtOnce` 或 `NukeACity` 出现在 staged 列表
- `code/` 下5个文件全部 staged
- `videos/short/` 下20个 s0x.mp4 全部 staged

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: complete experiment site — 4-group video config, GitHub Pages ready"
```

- [ ] **Step 6: Push**

```bash
git push -u origin main
```

若提示输入密码，使用 GitHub Personal Access Token（在 GitHub Settings → Developer settings → Personal access tokens 生成）。

- [ ] **Step 7: 启用 GitHub Pages**

1. 打开 repo 页面 → `Settings` → `Pages`（左侧导航）
2. Source: `Deploy from a branch`
3. Branch: `main`，Folder: `/ (root)`
4. 点击 `Save`
5. 等待约1-2分钟，刷新页面确认看到绿色 "Your site is live at" 提示

- [ ] **Step 8: 验证线上版本**

打开 `https://warchef.github.io/lumiere-attention-study/code/`

确认：
1. 页面正常加载（知情同意书）
2. 切换语言按钮（EN/中文）正常
3. 没有 debug 面板（debug: false）
4. 用 G3/G4 测试（需通过 URL 参数或临时改 debug 回 true）

---

## 自检清单

- [ ] 20个短视频全部重命名为 s01-s20，无特殊字符
- [ ] config.js：4组视频路径与时长全部填写，无占位符
- [ ] apps-script.js：HEADERS 包含 29 列，与 data.js payload 完全一致
- [ ] Google Sheets 收到测试数据，列名正确
- [ ] GitHub Pages URL 可访问，视频正常播放
- [ ] debug: false 已设置，跳过按钮不可见

---

## 注意事项（4/18 会议时与 Lila 确认）

- 时长条件已从 8/16min 改为 7/14min，更接近实际视频时长（~6min / ~14min）
- Research Question 中的"8 vs. 16 minutes"需同步更新为"7 vs. 14 minutes"——等 Lila 确认后修改论文文本
