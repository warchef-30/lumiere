# Lumiere SART 在线实验工具 · 设计文档

**日期**：2026-04-02  
**项目**：Lumiere Research Scholar Program — 视频格式与注意力研究  
**研究问题**：How do video format (short-form vs. long-form) and total viewing duration (8 vs. 16 minutes) affect subsequent sustained attention performance and subjective mood?

---

## 实验设计

2×2 between-subjects 设计，四组：

| 组别 | 视频类型 | 时长 |
|------|----------|------|
| 组1 | 短视频（TikTok风格） | 8 分钟 |
| 组2 | 短视频（TikTok风格） | 16 分钟 |
| 组3 | 长视频（YouTube风格） | 8 分钟 |
| 组4 | 长视频（YouTube风格） | 16 分钟 |

参与者进入页面后随机分配到四组之一（each group 25人，目标总计 100 人）。

---

## 实验流程（10个屏幕）

```
欢迎页 → 倒计时(10s) → 基线问卷 → 视频说明
→ 视频播放 → 情绪问卷 → SART说明
→ SART练习(18题) → 正式SART(225题) → 完成页
```

### 各屏幕说明

1. **欢迎页**：研究简介，告知匿名、三阶段流程、约25-35分钟
2. **倒计时**：10秒，让参与者准备好
3. **基线问卷**：睡眠时长、过去30分钟活动、精力水平(1-5)、压力水平(1-5)
4. **视频说明**：告知即将观看视频，全程专注，不要切换页面
5. **视频播放**：YouTube iframe embed，无法拖进度条；显示剩余时间和进度条；debug模式下显示跳过按钮
6. **情绪问卷**：happy(1-5)、sad(1-5)分开问；社媒每日时长；使用方式（浏览为主/发布为主/两者）
7. **SART说明**：规则说明（1-9数字，见3不按，其余按空格/点击）
8. **SART练习**：18题（每个数字2次），有即时对错反馈
9. **正式SART**：225题（每个数字25次），无反馈
10. **完成页**：感谢语，显示参与者编号

---

## 文件结构

```
Lumiere/
├── code/
│   ├── index.html       # 页面骨架（HTML结构）
│   ├── style.css        # 所有样式，响应式
│   ├── config.js        # 唯一需要手动编辑的文件
│   ├── experiment.js    # 实验主逻辑
│   └── data.js          # 数据收集与提交
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-04-02-lumiere-sart-design.md
└── README.md            # 部署说明
```

### config.js 结构

```js
const CONFIG = {
  debug: true,          // 上线前改为 false，跳过按钮消失

  sheetsUrl: 'YOUR_APPS_SCRIPT_URL_HERE',  // 部署后填入

  videos: {
    1: { url: 'https://www.youtube.com/embed/PLACEHOLDER_SHORT_8', durationSec: 8 * 60 },
    2: { url: 'https://www.youtube.com/embed/PLACEHOLDER_SHORT_16', durationSec: 16 * 60 },
    3: { url: 'https://www.youtube.com/embed/PLACEHOLDER_LONG_8', durationSec: 8 * 60 },
    4: { url: 'https://www.youtube.com/embed/PLACEHOLDER_LONG_16', durationSec: 16 * 60 },
  },

  sart: {
    digitMs: 250,                        // Robertson et al. 1997
    maskMs: 900,
    fontSizes: [48, 72, 94, 100, 120],   // 5种字号，随机分配
    target: 3,                           // no-go digit
    practiceTrials: 18,
    mainTrials: 225,
  },
};
```

---

## SART 技术规格

基于 Robertson et al. (1997) 原始参数：

- 每个数字呈现：250ms
- Circle-cross mask：900ms（总 SOA = 1150ms）
- 数字字号：5种（48/72/94/100/120px），每题随机选取
- 目标数字：3（no-go，不按键）
- 非目标数字：1/2/4/5/6/7/8/9（go，按空格或点击）
- 练习：18题（每个数字×2），有对错反馈
- 正式：225题（每个数字×25），无反馈
- 序列约束：目标数字3不连续出现（最少间隔2个非目标）

**响应方式**：
- 桌面端：空格键
- 移动端：点击屏幕任意位置

---

## 数据收集

每位参与者完成后向 Google Sheets 提交一行，字段如下：

| 字段 | 说明 |
|------|------|
| participant_id | UUID，随机生成 |
| timestamp | ISO 8601 格式 |
| group | 1-4 |
| group_label | 组别文字描述 |
| bl_sleep | 睡眠时长（小时） |
| bl_activity | 过去30分钟活动类型 |
| bl_energy | 精力水平(1-5) |
| bl_stress | 压力水平(1-5) |
| mood_happy | 幸福感(1-5) |
| mood_sad | 悲伤感(1-5) |
| sm_hours | 社媒每日时长 |
| sm_type | 社媒使用方式 |
| sart_commission_errors | 错误按键次数（见到3按了） |
| sart_omission_errors | 漏按次数（该按没按） |
| sart_mean_rt_ms | 平均反应时（ms） |
| sart_sdrt_ms | 反应时标准差（注意力变异性指标） |
| tab_switched | 是否中途切换页面（true/false） |
| sart_trials | 每题原始数据（JSON字符串） |

**注**：分析时需以 mean RT 为协变量（ANCOVA），控制速度-准确性权衡效应（Robertson et al. 1997; Helton 2009）。

---

## 部署流程

1. 在 GitHub 创建仓库（如 `lumiere-sart`）
2. 将 `code/` 目录内容推送
3. Settings → Pages → 选择 main branch → Save
4. 自动生成链接：`https://username.github.io/lumiere-sart`
5. 将链接发给参与者

**上线前 checklist**：
- [ ] 填入真实视频 YouTube embed URL（`config.js`）
- [ ] 部署 Google Apps Script，填入 `sheetsUrl`（`config.js`）
- [ ] 将 `debug: true` 改为 `debug: false`（`config.js`）
- [ ] 测试完整流程一遍（桌面 + 手机）

---

## 质量保障

- **页面切换检测**：`visibilitychange` 事件监听，记录到 `tab_switched` 字段
- **视频无法跳过**：YouTube embed 参数禁用进度条控制（`controls=0`）
- **全部字段必填**：问卷提交前验证，有空项则提示

---

*设计者：Claude（Superpowers brainstorming skill）· 2026-04-02*
