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
  //   可从 YouTube 搜索 "short video compilation" 或 "relaxing vlog" 获取视频ID
  videos: {
    1: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
    2: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
    3: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 8  * 60 },
    4: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 16 * 60 },
  },

  // ── SART 参数（Robertson et al., 1997，修改版）─────────
  // digitMs 从原版 250ms 调整为 500ms，适配普通参与者；需在论文 Methods 注明此修改
  sart: {
    digitMs:        500,                     // 数字呈现时长（ms）
    maskMs:         700,                     // circle-cross mask 时长（ms）
    fontSizes:      [48, 72, 94, 100, 120],  // 5种字号（px），每题随机选取
    target:         3,                       // no-go 数字（见到不按）
    practiceTrials: 18,                      // 练习题数（每个数字×2）
    mainTrials:     225,                     // 正式题数（每个数字×25）
  },

};
