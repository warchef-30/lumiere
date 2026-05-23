// ═══════════════════════════════════════════════════════
// config.js — Lumiere SART 实验配置
// 这是唯一需要手动编辑的文件。
// 上线前需修改：debug → false，填入 sheetsUrl 和视频 URL。
// （2026-05-21 revert：sheetsUrl 从 Cloudflare Worker 改回 Apps Script）
// ═══════════════════════════════════════════════════════

const CONFIG = {

  // ── 调试开关 ──────────────────────────────────────────
  // true = 显示视频跳过按钮（本地调试用）
  // false = 隐藏跳过按钮（正式上线用）
  debug: false,

  // ── 数据提交地址（经 Cloudflare Worker 中继）──────────
  // Worker 会转发到 Google Apps Script。
  // 这样配置的好处：① 国内访问 ② 拿得到错误反馈 ③ Apps Script URL 不暴露在前端
  sheetsUrl: 'https://lumiererelay.uk',

  // ── 实验分组视频 ──────────────────────────────────────
  // type 'local': src = 本地 MP4 路径数组（相对于 index.html），按顺序播放
  // durationSec: 视频实际总时长（秒），播放结束后自动进入下一步
  //
  // 5/23 更新：全部换为抖音视频，适配见数中国用户群体
  // 组1（抖音短视频 8min）：s01–s13，实际 498s
  // 组2（抖音短视频 16min）：s01–s26，实际 952s
  // 组3（抖音长视频 8min）：ComedyFilm-8min.mp4，实际 505s
  // 组4（抖音长视频 16min）：MrBeast-16min.mp4，实际 974s
  videos: {
    1: {
      type: 'local',
      src: [
        '../videos/short/s01.mp4',
        '../videos/short/s02.mp4',
        '../videos/short/s03.mp4',
        '../videos/short/s04.mp4',
        '../videos/short/s05.mp4',
        '../videos/short/s06.mp4',
        '../videos/short/s07.mp4',
        '../videos/short/s08.mp4',
        '../videos/short/s09.mp4',
        '../videos/short/s10.mp4',
        '../videos/short/s11.mp4',
        '../videos/short/s12.mp4',
        '../videos/short/s13.mp4'
      ],
      durationSec: 498
    },
    2: {
      type: 'local',
      src: [
        '../videos/short/s01.mp4',
        '../videos/short/s02.mp4',
        '../videos/short/s03.mp4',
        '../videos/short/s04.mp4',
        '../videos/short/s05.mp4',
        '../videos/short/s06.mp4',
        '../videos/short/s07.mp4',
        '../videos/short/s08.mp4',
        '../videos/short/s09.mp4',
        '../videos/short/s10.mp4',
        '../videos/short/s11.mp4',
        '../videos/short/s12.mp4',
        '../videos/short/s13.mp4',
        '../videos/short/s14.mp4',
        '../videos/short/s15.mp4',
        '../videos/short/s16.mp4',
        '../videos/short/s17.mp4',
        '../videos/short/s18.mp4',
        '../videos/short/s19.mp4',
        '../videos/short/s20.mp4',
        '../videos/short/s21.mp4',
        '../videos/short/s22.mp4',
        '../videos/short/s23.mp4',
        '../videos/short/s24.mp4',
        '../videos/short/s25.mp4',
        '../videos/short/s26.mp4'
      ],
      durationSec: 952
    },
    3: {
      type: 'local',
      src: ['../videos/long/ComedyFilm-8min.mp4'],
      durationSec: 505
    },
    4: {
      type: 'local',
      src: ['../videos/long/MrBeast-16min.mp4'],
      durationSec: 974
    },
  },

  // ── SART 参数（Robertson et al., 1997）──────────────────
  // digitMs/maskMs 已恢复原版参数（4/4 Lila 邮件确认 + 原文核查）
  // 每轮节奏：250ms digit + 900ms mask = 1150ms，与原论文一致
  sart: {
    digitMs: 250,           // 正式测试：数字呈现时长（ms）
    maskMs: 900,            // 正式测试：circle-cross mask 时长（ms）
    practiceDigitMs: 800,   // 练习：数字呈现更久，让参与者看清
    practiceMaskMs: 1000,   // 练习：mask 停留更久，配合反馈阅读
    fontSizes: [48, 72, 94, 100, 120], // 5种字号（px），每题随机选取
    target: 3,              // no-go 数字（见到不按）
    practiceTrials: 9,      // 练习题数（每个数字×1）
    mainTrials: 225,        // 正式题数（每个数字×25，约4分20秒）
  },

};
