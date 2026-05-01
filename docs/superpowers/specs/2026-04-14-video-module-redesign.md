# Video Module Redesign — Long Video Groups (3 & 4)

**Date:** 2026-04-14  
**Scope:** Replace YouTube iframe with local MP4 playback for Groups 3 & 4. Groups 1 & 2 unchanged.

---

## Background

The current experiment uses a single `<iframe id="videoFrame">` for all 4 groups, pulling from YouTube embed URLs. Groups 3 & 4 must switch to locally-hosted MP4 files to avoid YouTube access issues and ensure controlled playback.

Video assignments:
- **Group 3** (8 min): `../week6/FermiParadox-6min.mp4` (~8.9 min) — single video
- **Group 4** (16 min): `../week6/AllNukesAtOnce-7min.mp4` (~7.1 min) → `../week6/NukeACity-9min.mp4` (~9 min) — sequential playlist

Groups 1 & 2 continue to use YouTube iframes (unchanged).

---

## Changes

### 1. `config.js`

Add `type` field to distinguish video kinds. Groups 3 & 4 use `type: 'local'` with a `src` array instead of a single `url` string.

```js
videos: {
  1: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 8  * 60 },
  2: { type: 'youtube', url: 'https://www.youtube.com/embed/jNQXAC9IVRw', durationSec: 16 * 60 },
  3: { type: 'local',   src: ['../week6/FermiParadox-6min.mp4'],           durationSec: 8  * 60 },
  4: { type: 'local',   src: ['../week6/AllNukesAtOnce-7min.mp4',
                               '../week6/NukeACity-9min.mp4'],             durationSec: 16 * 60 },
},
```

### 2. `index.html` — `#videoBox`

Add a `<video>` element alongside the existing iframe. Both are hidden by default; JS controls which is visible.

```html
<div id="videoBox">
  <iframe id="videoFrame" allowfullscreen
    allow="autoplay; encrypted-media"
    src="about:blank"
    style="display:none">
  </iframe>
  <video id="videoPlayer" style="display:none"></video>
</div>
```

> Note: the existing iframe gains `style="display:none"` as default. `_startVideo()` shows the correct element.

### 3. `experiment.js` — Video section refactor

Replace the inline logic in the `btn-video-start` click handler with two named functions.

#### `_startVideo(groupCfg)`

```js
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
      // If playlist exhausted before timer fires, video simply stops.
      // Timer still controls advancement.
    };

    player.addEventListener('ended', playNext, { signal: _videoEndedAC.signal });
    playNext();

  } else {
    // YouTube iframe path (Groups 1 & 2) — existing logic
    player.style.display = 'none';
    frame.style.display  = 'block';
    frame.src = `${groupCfg.url}?autoplay=1&controls=0&disablekb=1&rel=0&modestbranding=1`;
  }
}
```

#### `_stopVideo()`

```js
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

#### Updated `btn-video-start` handler

```js
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

#### Updated `_afterVideo()`

```js
function _afterVideo() {
  _stopVideo();
  showScreen('s-mood');
}
```

#### New module-level variable

```js
let _videoEndedAC = null;   // AbortController for the 'ended' listener
```

### 4. `style.css` — `#videoBox video`

`#videoBox iframe` already has absolute-fill styling. Add the same rule for `video`:

```css
#videoBox video {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: none;
  pointer-events: none; /* prevent users from seeking */
}
```

---

## Behavior Summary

| Group | Type | Playback |
|-------|------|----------|
| 1 | YouTube iframe | Unchanged |
| 2 | YouTube iframe | Unchanged |
| 3 | Local MP4 | Single video plays; timer fires at 8 min → advance |
| 4 | Local MP4 | Video 1 plays → `ended` → Video 2 plays; timer fires at 16 min → advance |

Timer always controls screen advancement. If a video ends before the timer, playback simply stops (no loop, no crash). Cleanup on `_stopVideo()` is complete: event listener aborted, playback paused, src cleared.

---

## Out of Scope

- Groups 1 & 2 (short video) — separate task
- GitHub Pages file hosting (videos are served locally for now)
