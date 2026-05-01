# Video Module Redesign (Long Videos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace YouTube iframe with local MP4 playback for Groups 3 & 4, while leaving Groups 1 & 2 unchanged.

**Architecture:** Add a `type` field to the config so `_startVideo()` routes to either the existing iframe path (Groups 1 & 2) or a new `<video>` element with sequential playlist (Groups 3 & 4). An `AbortController` cleans up the `ended` listener on stop. The countdown timer continues to control screen advancement for all groups.

**Tech Stack:** Vanilla HTML/CSS/JS, no build step, served via local file:// or simple HTTP server.

---

## File Map

| File | Change |
|------|--------|
| `code/config.js` lines 26–31 | Add `type` field; Groups 3&4 switch to `src` array |
| `code/style.css` after line 160 | Add `#videoBox video` rule |
| `code/index.html` lines 292–295 | Add `<video id="videoPlayer">`, both elements default hidden |
| `code/experiment.js` line 466 | Add `let _videoEndedAC = null` |
| `code/experiment.js` lines 720–755 | Replace inline logic with `_startVideo()` / `_stopVideo()` functions + updated `_afterVideo()` |

---

### Task 1: Update `config.js` — add type field and local src arrays

**Files:**
- Modify: `code/config.js` lines 26–31

- [ ] **Step 1: Replace the `videos` block**

Open `code/config.js`. Replace lines 26–31:

```js
// BEFORE
videos: {
  1: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
  2: { url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
  3: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 8  * 60 },
  4: { url: 'https://www.youtube.com/embed/aqz-KE-bpKQ',  durationSec: 16 * 60 },
},
```

With:

```js
// AFTER
videos: {
  1: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
  2: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
  3: { type: 'local',   src: ['../week6/FermiParadox-6min.mp4'],           durationSec: 8  * 60 },
  4: { type: 'local',   src: ['../week6/AllNukesAtOnce-7min.mp4',
                               '../week6/NukeACity-9min.mp4'],             durationSec: 16 * 60 },
},
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/mengzihe/Desktop/高中/个人/Lumiere"
git add code/config.js
git commit -m "config: add type field, set groups 3+4 to local MP4 sources"
```

---

### Task 2: Update `style.css` — add `#videoBox video` rule

**Files:**
- Modify: `code/style.css` after line 160

- [ ] **Step 1: Add CSS rule after the `#videoBox iframe` block**

In `code/style.css`, after the closing `}` of `#videoBox iframe` (currently ends at line 160), add:

```css
#videoBox video {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
  pointer-events: none; /* prevent users from seeking */
}
```

- [ ] **Step 2: Commit**

```bash
git add code/style.css
git commit -m "style: add #videoBox video rule for local MP4 sizing"
```

---

### Task 3: Update `index.html` — add `<video>` element

**Files:**
- Modify: `code/index.html` lines 292–295

- [ ] **Step 1: Replace the videoBox contents**

In `code/index.html`, find the `<div id="videoBox">` block (lines 291–296):

```html
<!-- BEFORE -->
<div id="videoBox">
  <iframe id="videoFrame" allowfullscreen
    allow="autoplay; encrypted-media"
    src="about:blank">
  </iframe>
</div>
```

Replace with:

```html
<!-- AFTER -->
<div id="videoBox">
  <iframe id="videoFrame" allowfullscreen
    allow="autoplay; encrypted-media"
    src="about:blank"
    style="display:none">
  </iframe>
  <video id="videoPlayer" style="display:none"></video>
</div>
```

Both elements start hidden. `_startVideo()` (Task 4) shows the correct one.

- [ ] **Step 2: Commit**

```bash
git add code/index.html
git commit -m "html: add video element to videoBox, both elements default hidden"
```

---

### Task 4: Refactor `experiment.js` — extract `_startVideo` / `_stopVideo`

**Files:**
- Modify: `code/experiment.js` line 466, lines 720–755

- [ ] **Step 1: Add `_videoEndedAC` variable after `_videoTimer`**

In `code/experiment.js`, find line 466:

```js
let _videoTimer = null;
```

Add the new variable on the line immediately after:

```js
let _videoTimer   = null;
let _videoEndedAC = null;   // AbortController for the video 'ended' listener
```

- [ ] **Step 2: Add `_startVideo()` and `_stopVideo()` functions before the SCREEN 8→9 comment block**

Find this comment in `experiment.js`:

```js
// ════════════════════════════════════════════════════════
//  SCREEN 8 → 9: 视频说明 → 视频播放
// ════════════════════════════════════════════════════════
```

Insert the two functions immediately before that comment:

```js
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
      // Playlist exhausted before timer: video stops, timer still controls advancement
    };

    player.addEventListener('ended', playNext, { signal: _videoEndedAC.signal });
    playNext();

  } else {
    // YouTube iframe path (Groups 1 & 2)
    player.style.display = 'none';
    frame.style.display  = 'block';
    frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;
  }
}

function _stopVideo() {
  const frame  = document.getElementById('videoFrame');
  const player = document.getElementById('videoPlayer');

  // Stop iframe
  frame.src = 'about:blank';
  frame.style.display = 'none';

  // Stop video player and remove ended listener
  if (_videoEndedAC) { _videoEndedAC.abort(); _videoEndedAC = null; }
  player.pause();
  player.src = '';
  player.style.display = 'none';
}

```

- [ ] **Step 3: Update the `btn-video-start` click handler**

Find and replace the entire handler (lines 720–745):

```js
// BEFORE
document.getElementById('btn-video-start').addEventListener('click', () => {
  showScreen('s-video');

  const groupCfg = CONFIG.videos[State.group];
  const frame    = document.getElementById('videoFrame');

  frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;

  document.getElementById('video-group-tag').textContent =
    LANG.current === 'zh' ? `组${State.group}` : `Group ${State.group}`;

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
```

Replace with:

```js
// AFTER
document.getElementById('btn-video-start').addEventListener('click', () => {
  showScreen('s-video');

  const groupCfg = CONFIG.videos[State.group];
  _startVideo(groupCfg);

  document.getElementById('video-group-tag').textContent =
    LANG.current === 'zh' ? `组${State.group}` : `Group ${State.group}`;

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
```

- [ ] **Step 4: Update `_afterVideo()`**

Find:

```js
function _afterVideo() {
  document.getElementById('videoFrame').src = 'about:blank';
  showScreen('s-mood');
}
```

Replace with:

```js
function _afterVideo() {
  _stopVideo();
  showScreen('s-mood');
}
```

- [ ] **Step 5: Commit**

```bash
git add code/experiment.js
git commit -m "feat: refactor video module — _startVideo/_stopVideo, local MP4 support for groups 3+4"
```

---

### Task 5: Manual verification in browser

No automated test suite exists. Verify each scenario manually.

**Setup:** Open `code/index.html` via a local HTTP server (required for `<video>` src to load):

```bash
cd "/Users/mengzihe/Desktop/高中/个人/Lumiere/code"
python3 -m http.server 8080
```

Then open `http://localhost:8080` in Chrome/Safari.

- [ ] **Verify Group 3 (local, single video):**
  1. In browser console: `State.group = 3` then navigate to screen s-video-intro
  2. Click "开始观看"
  3. Expected: black video area shows `FermiParadox-6min.mp4` starts playing, timer counts down from 8:00
  4. Click "⏭ 跳过（调试用）" → expected: video stops, mood screen appears

- [ ] **Verify Group 4 (local, sequential):**
  1. Console: `State.group = 4`, navigate to s-video-intro
  2. Click "开始观看"
  3. Expected: `AllNukesAtOnce-7min.mp4` plays. After ~7 min, `NukeACity-9min.mp4` auto-starts
  4. Click skip at any point → expected: video stops immediately, mood screen appears

- [ ] **Verify Groups 1 & 2 still work (YouTube iframe):**
  1. Console: `State.group = 1`, navigate to s-video-intro
  2. Click "开始观看"
  3. Expected: YouTube iframe appears and loads, timer counts down from 8:00
  4. Click skip → expected: iframe clears, mood screen appears

- [ ] **Verify no ghost video after navigation:**
  1. Complete a Group 3 run through to the mood screen
  2. Open browser DevTools → Elements → find `#videoPlayer`
  3. Expected: `src=""`, `display:none`, no ongoing playback

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: verify video module changes complete"
```
