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
  // type 'youtube': url = YouTube embed 地址
  // type 'local':   src = 本地 MP4 路径数组（相对于 index.html），按顺序播放
  // durationSec: 计时器时长（秒），时间到自动进入下一步
  //
  // 组1/2（短视频）：待填入 YouTube Shorts 本地文件
  // 组3：FermiParadox (~8.9min)，计时 8min
  // 组4：AllNukesAtOnce (~7.1min) → NukeACity (~9min)，计时 16min
  videos: {
    1: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
    2: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
    3: { type: 'local',   src: ['../week6/FermiParadox-6min.mp4'],           durationSec: 8  * 60 },
    4: { type: 'local',   src: ['../week6/AllNukesAtOnce-7min.mp4',
                                 '../week6/NukeACity-9min.mp4'],             durationSec: 16 * 60 },
  },

  // ── SART 参数（Robertson et al., 1997）──────────────────
  // digitMs/maskMs 已恢复原版参数（4/4 Lila 邮件确认 + 原文核查）
  // 每轮节奏：250ms digit + 900ms mask = 1150ms，与原论文一致
  sart: {
    digitMs:        250,                     // 正式测试：数字呈现时长（ms）
    maskMs:         900,                     // 正式测试：circle-cross mask 时长（ms）
    practiceDigitMs: 800,                    // 练习：数字呈现更久，让参与者看清
    practiceMaskMs:  1000,                   // 练习：mask 停留更久，配合反馈阅读
    fontSizes:      [48, 72, 94, 100, 120],  // 5种字号（px），每题随机选取
    target:         3,                       // no-go 数字（见到不按）
    practiceTrials: 9,                       // 练习题数（每个数字×1）
    mainTrials:     225,                     // 正式题数（每个数字×25，约4分20秒）
  },

};
