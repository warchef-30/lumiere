# Lumiere SART 实验工具

视频格式与注意力研究 · 在线实验工具

## 快速开始（本地测试）

直接用浏览器打开 `code/index.html` 即可。无需安装任何依赖。

---

## 上线前必做

编辑 `code/config.js`，完成以下三项：

### 1. 填入视频 URL

找到 `videos` 字段，替换每组的 YouTube embed URL：
- **组1/2（短视频）**：搜索 "YouTube Shorts compilation"，找内容轻松、节奏快的合集
- **组3/4（长视频）**：搜索 "relaxing documentary" 或 "nature documentary"，找横屏完整视频

YouTube embed URL 格式：
```
https://www.youtube.com/embed/视频ID
```
（视频ID 是 YouTube 链接 `?v=` 后面的字符串，例如 `jNQXAC9IVRw`）

### 2. 部署 Google Apps Script

1. 打开 Google Sheets，新建表格（命名任意）
2. 菜单 → 扩展程序 → Apps Script
3. 将 `apps-script.js` 全部内容粘贴进去，替换原有代码
4. 点击「部署」→「新建部署」
   - 类型选：**Web 应用**
   - 执行身份：我（你的 Google 账号）
   - 访问权限：**任何人**
5. 授权，复制生成的 Web App URL
6. 将 URL 填入 `code/config.js` 的 `sheetsUrl` 字段

### 3. 关闭调试模式

将 `code/config.js` 中：
```js
debug: true,
```
改为：
```js
debug: false,
```

---

## 部署到 GitHub Pages

```bash
# 1. 在 GitHub 创建新仓库（建议命名 lumiere-sart）
# 2. 推送代码
git remote add origin https://github.com/你的用户名/lumiere-sart.git
git branch -M main
git push -u origin main
```

推送后，在 GitHub 仓库页面：
**Settings → Pages → Source: Deploy from a branch → Branch: main / root → Save**

等待约 1 分钟，访问链接：
```
https://你的用户名.github.io/lumiere-sart/code/
```

将此链接发给参与者即可直接使用。

---

## 上线 Checklist

- [ ] 填入真实视频 YouTube embed URL（`code/config.js` → `videos`）
- [ ] 部署 Google Apps Script，填入 `sheetsUrl`（`code/config.js`）
- [ ] 将 `debug: true` 改为 `debug: false`（`code/config.js`）
- [ ] 本地完整测试一遍（桌面端）
- [ ] 手机浏览器测试一遍（移动端）
- [ ] 推送到 GitHub，确认 GitHub Pages 链接可访问

---

## 数据说明

每位参与者完成后，数据自动写入 Google Sheets 一行：

| 字段 | 说明 |
|------|------|
| participant_id | 随机UUID，匿名标识 |
| group | 1–4，对应四个实验组 |
| bl_sleep / bl_energy / bl_stress | 基线：睡眠、精力、压力 |
| mood_happy / mood_sad | 情绪问卷（各1–5分） |
| sm_hours / sm_type | 社交媒体使用习惯 |
| sart_commission_errors | 见到3却按键的次数 |
| sart_omission_errors | 该按键却未按的次数 |
| sart_mean_rt_ms | 平均反应时（毫秒） |
| sart_sdrt_ms | 反应时标准差（注意力变异性指标） |
| tab_switched | 是否中途切换页面 |
| sart_trials | 每题详细数据（JSON） |

**分析建议**：以 mean RT 为协变量做 ANCOVA，控制速度-准确性权衡效应（Robertson et al., 1997）。

---

## 文件结构

```
Lumiere/
├── code/
│   ├── index.html       # 实验页面入口
│   ├── config.js        # ← 唯一需要手动编辑的文件
│   ├── data.js          # 数据收集逻辑（无需修改）
│   ├── experiment.js    # 实验主逻辑（无需修改）
│   └── style.css        # 样式（无需修改）
├── apps-script.js       # Google Sheets 后端（单独部署）
├── docs/                # 设计文档和实施计划
└── README.md
```
