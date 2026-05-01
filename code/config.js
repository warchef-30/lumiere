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
  sheetsUrl: 'https://script.google.com/macros/s/AKfycbyeex-SPo3FBMog7t8-zQvTsMKBdueGdVkWi75lJbuXW9ozYSsVaufb02wHf1F5ABXpyg/exec',

  // ── 实验分组视频 ──────────────────────────────────────
  // type 'local': src = 本地 MP4 路径数组（相对于 index.html），按顺序播放
  // durationSec: 视频实际总时长（秒），播放结束后自动进入下一步
  //
  // 组1（短视频 7min）：s01–s10，实际 363s
  // 组2（短视频 14min）：s01–s20，实际 826s
  // 组3（长视频 7min）：FermiParadox-6min.mp4，实际 380s
  // 组4（长视频 14min）：SubwaySurfurs-13min.mp4，实际 813s
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
        '../videos/short/s10.mp4'
      ],
      durationSec: 363
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
        '../videos/short/s20.mp4'
      ],
      durationSec: 826
    },
    3: {
      type: 'local',
      src: ['../videos/long/FermiParadox-6min.mp4'],
      durationSec: 380,
      subtitles: {
        en: '../videos/long/FermiParadox-6min.en.vtt',
        zh: '../videos/long/FermiParadox-6min.zh.vtt'
      }
    },
    4: {
      type: 'local',
      src: ['../videos/long/SubwaySurfurs-13min.mp4'],
      durationSec: 813,
      subtitles: {
        en: '../videos/long/SubwaySurfurs-13min.en.vtt',
        zh: '../videos/long/SubwaySurfurs-13min.zh.vtt'
      }
    },
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
