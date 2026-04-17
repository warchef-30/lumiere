# Lumiere 实验网站完成设计文档

**日期：** 2026-04-17
**状态：** 已批准
**关联 Plan：** `docs/superpowers/plans/2026-04-17-experiment-completion.md`

---

## 目标

将 Lumiere SART 实验网站从"代码完整但视频未配置"状态推进到"可供参与者正式访问"——填入4组视频配置、修复数据 schema、完成 GitHub Pages 部署。

---

## 实验设计（最终版）

**研究设计：** 2（视频格式：短视频 vs 长视频）× 2（观看时长：7min vs 14min）between-subjects

> ⚠️ **待 Lila 确认（4/18 会议）：** Research Question 中的"8 vs. 16 minutes"需更新为"7 vs. 14 minutes"，以匹配实际视频素材时长。

| 组 | 视频格式 | 时长条件 | 视频内容 | 实际时长 |
|----|----------|----------|----------|----------|
| 1 | YouTube Shorts | 7min | s01–s10（10条短视频） | 363s（6.05min） |
| 2 | YouTube Shorts | 14min | s01–s20（全部20条） | 826s（13.77min） |
| 3 | YouTube 长视频 | 7min | FermiParadox-6min.mp4 | 380s（6.33min） |
| 4 | YouTube 长视频 | 14min | SubwaySurfurs-13min.mp4 | 813s（13.55min） |

**时长标签依据：** 7min 条件实际约 6min，14min 条件实际约 14min。标签取近似整数，在论文 Methods 中注明实际时长。

---

## 需要改动的文件

### 1. `videos/short/*.mp4` — 文件重命名

**问题：** 原始文件名含 emoji、韩文、特殊字符，在 HTML `src` 路径中不可靠。

**方案：** 按系统 glob 展开顺序，批量重命名为 `s01.mp4`–`s20.mp4`。

重命名映射（glob 展开顺序，基于 macOS 文件系统排序）：
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

### 2. `code/config.js` — 视频配置 + 时长标签

**需要改动：**
- `videos` 对象：填入4组实际路径和 `durationSec`
- `durationSec` = 所选视频实际总时长（视频自然结束，无计时器截断）
- UI 显示时长从 8/16 改为 7/14（`video_duration_hint` 用 durationSec/60 自动计算，无需手动改）

最终 `videos` 配置：
```js
videos: {
  1: { type: 'local',
       src: ['../videos/short/s01.mp4', ..., '../videos/short/s10.mp4'],
       durationSec: 363 },
  2: { type: 'local',
       src: ['../videos/short/s01.mp4', ..., '../videos/short/s20.mp4'],
       durationSec: 826 },
  3: { type: 'local',
       src: ['../videos/long/FermiParadox-6min.mp4'],
       durationSec: 380 },
  4: { type: 'local',
       src: ['../videos/long/SubwaySurfurs-13min.mp4'],
       durationSec: 813 },
}
```

`debug` 和 `sheetsUrl` 在 Task 5（Apps Script 部署）完成后更新。

### 3. `apps-script.js` — HEADERS 同步

**问题：** 当前 HEADERS 是 v1.0（18列，单次 SART），与 `data.js` 实际 payload 不一致（29列，pre/post SART + 完整 demographics）。

**方案：** 替换 HEADERS 数组，与 `data.js` 的 payload keys 完全对齐：

```
participant_id, timestamp, group, group_label,
bl_sleep, bl_activity, bl_energy, bl_stress,
mood_happy, mood_sad, mood_energetic,
pre_sart_commission_errors, pre_sart_omission_errors,
pre_sart_mean_rt_ms, pre_sart_sdrt_ms,
post_sart_commission_errors, post_sart_omission_errors,
post_sart_mean_rt_ms, post_sart_sdrt_ms,
sm_hours, sm_type, videogame_hours,
age, gender, location, email,
tab_switched, pre_sart_trials, post_sart_trials
```

`doPost` 函数逻辑不变（`HEADERS.map(k => data[k])` 自动适配新列数）。

### 4. GitHub Pages 部署

**方案：** 视频文件直接 commit 进 repo（Option A）。

- 所有视频文件单个 < 100MB，符合 GitHub 限制 ✓
- Repo 总大小约 450MB，在 GitHub 1GB 软限制以内 ✓
- GitHub Pages source: `main` 分支 `/`（root）
- 实验 URL：`https://warchef.github.io/<repo-name>/code/`

**需要 commit 的视频：**
- `videos/short/s01.mp4` ~ `s20.mp4`（20个，重命名后）
- `videos/long/FermiParadox-6min.mp4`
- `videos/long/SubwaySurfurs-13min.mp4`

**不 commit：**
- `videos/long/AllNukesAtOnce-7min.mp4`（不再使用）
- `videos/long/NukeACity-9min.mp4`（不再使用）

---

## 不在本次范围内

- SART 逻辑、实验流程、UI 样式：不改
- Research Question 中的时长表述（8/16 → 7/14）：等 Lila 4/18 确认后手动更新论文，不改代码
- `data.js` 中 `group_label` 硬编码中文问题：低优先级，不在本次范围

---

## 成功标准

1. 本地 `python3 -m http.server` 服务下，4组视频均能正常播放并自然结束（无截断、无报错）
2. 走完完整流程后，Google Sheets 收到数据行，29列全部有值
3. GitHub Pages URL 可访问，consent → complete 全流程可运行
4. debug 面板在生产 URL 不可见（`debug: false`）
