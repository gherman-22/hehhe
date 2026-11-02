/**
 * Web Audio API + HTML5 Audio Player & Lyrics Engine
 *
 * =========================================================================
 * 🎵 THAY ĐỔI NHẠC NỀN:
 *   - Copy file mp3 vào public/assets/bgm.mp3 là tự nhận
 *   - Hoặc dán link online vào CUSTOM_BGM_URL bên dưới
 *   - Để '' thì dùng hộp nhạc tích hợp sẵn
 *
 * 🎤 THAY LỜI BÀI HÁT (KARAOKE):
 *   - Sửa mảng LYRICS_DATA bên dưới
 *   - Mỗi dòng: { t: <giây bắt đầu>, l: '<lời>' }
 *   - Ví dụ: { t: 5.2, l: 'Yêu em từ ngàn xưa...' }
 * =========================================================================
 */

const CUSTOM_BGM_URL = '/assets/bgm.mp3';

const SONG_INFO = {
  title: '一生的爱 · Nhất Sinh Địch Ái',
  artist: 'Lâm Tuấn Kiệt (JJ Lin)',
};

// =========================================================
// 🎤 LYRICS — chỉnh timestamp (t) theo file nhạc thực tế
//    t = số giây kể từ đầu bài
// =========================================================
const LYRICS_DATA = [
  { t: 0,    l: '🎵 一生的爱 · Nhất Sinh Địch Ái' },
  { t: 4,    l: '— Lâm Tuấn Kiệt (JJ Lin) —' },
  { t: 8,    l: '' },
  { t: 12,   l: '真的可以结束吗' },
  { t: 15,   l: 'Thật sự có thể kết thúc rồi sao?' },
  { t: 18,   l: '已经不需要回答' },
  { t: 21,   l: 'Đã chẳng còn cần phải đáp lời...' },
  { t: 24,   l: '满天的雪在下' },
  { t: 27,   l: 'Tuyết ngập trời đang rơi' },
  { t: 30,   l: '将我的心蒸发' },
  { t: 33,   l: 'Làm tan biến cả tâm can anh' },
  { t: 36,   l: '如果爱可以放下' },
  { t: 39,   l: 'Nếu tình yêu có thể buông bỏ' },
  { t: 42,   l: '为何那么多挣扎' },
  { t: 45,   l: 'Sao lại có lắm nỗi dằn vặt nhường kia...' },
  { t: 48,   l: '那冷风烙心如刀割' },
  { t: 52,   l: 'Cơn gió lạnh cứ hằn sâu vào tim' },
  { t: 55,   l: '彷佛爱的惩罚' },
  { t: 58,   l: 'Tựa như hình phạt của tình yêu 💔' },
  { t: 62,   l: '' },
  { t: 64,   l: '我终于明白对你的爱' },
  { t: 68,   l: 'Cuối cùng anh đã hiểu tình yêu dành cho em' },
  { t: 72,   l: '绝不可能更改' },
  { t: 75,   l: 'Tuyệt đối không thể đổi thay...' },
  { t: 78,   l: '我的心像片雪花为你存在' },
  { t: 83,   l: 'Trái tim anh tựa bông tuyết vì em mà tồn tại' },
  { t: 87,   l: '冰封成依赖' },
  { t: 90,   l: 'Đóng băng thành sự ỷ lại khôn nguôi...' },
  { t: 94,   l: '当全世界都把你忘怀' },
  { t: 98,   l: 'Cho dù cả thế giới có quên lãng em' },
  { t: 102,  l: '我绝不离开' },
  { t: 105,  l: 'Anh quyết không rời xa ❤️' },
  { t: 108,  l: '风雪淹埋不了期待' },
  { t: 112,  l: 'Mưa gió bão bùng không thể chôn vùi niềm mong mỏi' },
  { t: 117,  l: '我只想要给你我一生的爱' },
  { t: 122,  l: 'Anh chỉ muốn trao tặng em tình yêu trọn một đời... 💗' },
  { t: 128,  l: '' },
  { t: 132,  l: '我终于明白对你的爱' },
  { t: 136,  l: 'Cuối cùng anh đã thấu hiểu...' },
  { t: 140,  l: '绝不可能更改' },
  { t: 143,  l: 'Tình yêu này mãi không đổi thay' },
  { t: 146,  l: '我的心像片雪花为你存在' },
  { t: 151,  l: 'Trái tim anh — một bông tuyết — vì em mà tồn tại' },
  { t: 155,  l: '冰封成依赖' },
  { t: 158,  l: 'Đóng băng thành niềm ỷ lại 🌨️' },
  { t: 162,  l: '当全世界都把你忘怀' },
  { t: 166,  l: 'Khi cả thế giới quên đi hình bóng em' },
  { t: 170,  l: '我绝不离开' },
  { t: 173,  l: 'Anh quyết sẽ không rời đi...' },
  { t: 176,  l: '风雪淹埋不了期待' },
  { t: 180,  l: 'Bão tuyết không thể vùi lấp đi niềm đợi chờ' },
  { t: 185,  l: '我只想要给你我一生的爱' },
  { t: 190,  l: 'Anh chỉ muốn trao cho em — tình yêu một đời... 💗' },
  { t: 196,  l: '🎵' },
];

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.currentNoteIndex = 0;
    this.tempo = 140;

    this.audioElement = null;
    this.hasCustomAudio = false;
    this.bgmUrl = CUSTOM_BGM_URL;

    // Lyrics state
    this.lyricsInterval = null;
    this.currentLyricIndex = -1;

    this.melody = [
      { note: 659.25, dur: 0.5 }, { note: 587.33, dur: 0.5 },
      { note: 523.25, dur: 0.5 }, { note: 392.00, dur: 0.5 },
      { note: 440.00, dur: 1.0 }, { note: 523.25, dur: 1.0 },
      { note: 659.25, dur: 0.5 }, { note: 587.33, dur: 0.5 },
      { note: 523.25, dur: 0.5 }, { note: 440.00, dur: 0.5 },
      { note: 392.00, dur: 1.0 }, { note: 329.63, dur: 1.0 },
      { note: 440.00, dur: 0.5 }, { note: 523.25, dur: 0.5 },
      { note: 587.33, dur: 0.5 }, { note: 659.25, dur: 0.5 },
      { note: 587.33, dur: 1.0 }, { note: 523.25, dur: 1.5 },
      { note: 0, dur: 0.5 },
    ];

    this.checkSettingsAndInitAudio();
  }

  async checkSettingsAndInitAudio() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.bgmUrl) this.bgmUrl = data.bgmUrl;
      }
    } catch (e) {}
    this.initAudioElement(this.bgmUrl);
  }

  initAudioElement(url) {
    if (!url) { this.hasCustomAudio = false; return; }
    if (this.audioElement) { this.audioElement.pause(); this.audioElement = null; }

    const audio = new Audio();
    audio.src = url;
    audio.loop = true;
    audio.volume = 0.45;
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => { this.hasCustomAudio = true; });
    audio.addEventListener('error', () => { this.hasCustomAudio = false; });
    this.audioElement = audio;
  }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  playNote(freq, duration = 0.5, gainLevel = 0.08) {
    if (this.isMuted || !freq || freq <= 0) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(gainLevel * 0.4, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration * 1.5);
  }

  startMusic() {
    this.init();
    this.isMuted = false;
    this.isPlayingMusic = true;

    if (this.audioElement && this.hasCustomAudio) {
      const p = this.audioElement.play();
      if (p !== undefined) {
        p.catch(() => this.startSynthLoop());
        this.startLyricsEngine();
        return;
      }
    }
    this.startSynthLoop();
  }

  startSynthLoop() {
    if (this.musicTimer) clearTimeout(this.musicTimer);
    const playNext = () => {
      if (!this.isPlayingMusic || this.isMuted) return;
      const step = this.melody[this.currentNoteIndex];
      if (step.note > 0) this.playNote(step.note, step.dur, 0.06);
      this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;
      const delay = (step.dur * (60 / this.tempo)) * 1000;
      this.musicTimer = setTimeout(playNext, delay);
    };
    playNext();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.audioElement) this.audioElement.pause();
    if (this.musicTimer) { clearTimeout(this.musicTimer); this.musicTimer = null; }
    this.stopLyricsEngine();
  }

  toggleMusic() {
    if (this.isPlayingMusic && !this.isMuted) {
      this.stopMusic();
      this.isMuted = true;
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  // ─── Lyrics Engine ───────────────────────────────────────
  startLyricsEngine() {
    this.currentLyricIndex = -1;
    if (this.lyricsInterval) clearInterval(this.lyricsInterval);

    this.lyricsInterval = setInterval(() => {
      if (!this.audioElement || this.isMuted) return;
      const t = this.audioElement.currentTime;

      let idx = -1;
      for (let i = 0; i < LYRICS_DATA.length; i++) {
        if (LYRICS_DATA[i].t <= t) idx = i;
        else break;
      }

      if (idx !== this.currentLyricIndex) {
        this.currentLyricIndex = idx;
        this.showLyric(idx >= 0 ? LYRICS_DATA[idx].l : '');
      }
    }, 200);
  }

  stopLyricsEngine() {
    if (this.lyricsInterval) { clearInterval(this.lyricsInterval); this.lyricsInterval = null; }
    this.hideLyricBanner();
  }

  showLyric(text) {
    const banner = document.getElementById('lyrics-banner');
    if (!banner) return;

    if (!text) {
      banner.classList.remove('visible');
      return;
    }

    banner.classList.remove('visible');
    clearTimeout(banner._swapTimer);
    banner._swapTimer = setTimeout(() => {
      const line = banner.querySelector('.lyric-line');
      if (line) line.textContent = text;
      banner.classList.add('visible');
    }, 150);
  }

  hideLyricBanner() {
    const banner = document.getElementById('lyrics-banner');
    if (banner) banner.classList.remove('visible');
  }

  // ─── SFX ─────────────────────────────────────────────────
  playPop() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.13);
  }

  playCelebration() {
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.playNote(freq, 1.2, 0.12), idx * 160);
    });
  }

  playTap() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.06);
  }
}

window.soundManager = new SoundManager();
window.SONG_INFO = SONG_INFO;

// ─── Autoplay Logic ──────────────────────────────────────────────────────────
// Browsers block audio until the user interacts with the page.
// Strategy:
//   1. Try to play immediately (works on some mobile browsers & reloads).
//   2. If blocked, silently hook the FIRST touch/click anywhere → start music.
//   3. Once started, never re-trigger.

let _autoplayStarted = false;

function _tryAutoplay() {
  if (_autoplayStarted) return;

  const sm = window.soundManager;
  if (!sm) return;

  // Unmute & attempt play
  sm.isMuted = false;
  sm.isPlayingMusic = true;

  const audio = sm.audioElement;
  if (audio && sm.hasCustomAudio) {
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        _autoplayStarted = true;
        sm.startLyricsEngine();
        _setSongInfoBanner();
        _updateAudioBtn(true);
      }).catch(() => {
        // Blocked — reset and wait for first interaction
        sm.isMuted = true;
        sm.isPlayingMusic = false;
        _listenFirstInteraction();
      });
    }
  } else {
    // No custom audio ready yet — try again shortly, or wait for interaction
    sm.isMuted = true;
    sm.isPlayingMusic = false;
    _listenFirstInteraction();
  }
}

function _listenFirstInteraction() {
  if (_autoplayStarted) return;

  const handler = () => {
    if (_autoplayStarted) return;
    _autoplayStarted = true;

    const sm = window.soundManager;
    if (!sm || sm.isPlayingMusic) return;

    const started = sm.toggleMusic();
    if (started) {
      _setSongInfoBanner();
      _updateAudioBtn(true);
    }

    // Remove all listeners after first fire
    ['click', 'touchstart', 'keydown'].forEach(ev =>
      document.removeEventListener(ev, handler, { capture: true })
    );
  };

  ['click', 'touchstart', 'keydown'].forEach(ev =>
    document.addEventListener(ev, handler, { once: false, capture: true, passive: true })
  );
}

function _setSongInfoBanner() {
  if (!window.SONG_INFO) return;
  const infoEl = document.getElementById('lyric-song-info');
  if (infoEl) infoEl.textContent = `♪ ${window.SONG_INFO.title} · ${window.SONG_INFO.artist}`;
}

function _updateAudioBtn(isPlaying) {
  const btn = document.getElementById('btn-audio-toggle');
  if (!btn) return;
  btn.textContent = isPlaying ? '🎶' : '🎵';
  btn.classList.toggle('playing', isPlaying);
  btn.title = isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền lãng mạn';
}

// Also sync btn state when user manually toggles
const _origToggle = window.soundManager.toggleMusic.bind(window.soundManager);
window.soundManager.toggleMusic = function () {
  const result = _origToggle();
  _updateAudioBtn(result);
  if (result) { _setSongInfoBanner(); _autoplayStarted = true; }
  return result;
};

// Attempt autoplay as soon as audio element is ready (may resolve after fetch)
window.addEventListener('DOMContentLoaded', () => {
  // Give audio.js 800ms to fetch settings & init the Audio element
  setTimeout(_tryAutoplay, 800);
});
