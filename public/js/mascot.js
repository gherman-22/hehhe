/**
 * 🐰 Bé Thỏ Mochi - Romantic Emotional Mascot
 * Interactive SVG mascot that expresses emotions, blushes, wiggles ears,
 * changes eyes & mouth, and reacts to each question and answer!
 */

class MochiMascot {
  constructor(containerId = 'mascot-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.currentMood = 'intro';
    this.isPoked = false;
    this.pokeTimeout = null;
    this.savedMood = 'intro';
    this.savedSpeech = '';

    // Cute voice lines when poked by user
    this.pokeQuotes = [
      "Ái chà! Đừng chọc tớ ngại mà! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄",
      "Hồi hộp ghê á, cậu trả lời thật lòng nha! 🐾",
      "Tim tớ đập nhanh quá chừng nè... 💓",
      "Tớ đang ngóng câu trả lời của cậu đây! ✨",
      "Moa moa! Chúc cậu có một ngày thật ngọt ngào! 🌸"
    ];

    this.render();
    this.bindEvents();
  }

  // Generate SVG Mascot with reactive layers
  render() {
    this.container.innerHTML = `
      <div class="mascot-wrapper" id="mascot-wrapper">
        <!-- Speech Bubble -->
        <div class="mascot-bubble" id="mascot-speech">
          <span id="mascot-speech-text">Chào cậu! Tớ có một bí mật nhỏ muốn hỏi nè... 💌</span>
          <div class="bubble-arrow"></div>
        </div>

        <!-- Interactive Animated SVG Mascot -->
        <div class="mascot-avatar" id="mascot-avatar" title="Chạm vào tớ đi nè! 🐾">
          <svg class="mochi-svg" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <!-- Soft body gradient -->
              <linearGradient id="mochi-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="85%" stop-color="#fff0f5" />
                <stop offset="100%" stop-color="#fedce5" />
              </linearGradient>

              <!-- Inner ear gradient -->
              <linearGradient id="inner-ear-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffb3c1" />
                <stop offset="100%" stop-color="#ff8097" />
              </linearGradient>

              <!-- Heart gradient -->
              <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff4d6d" />
                <stop offset="100%" stop-color="#ff758c" />
              </linearGradient>
            </defs>

            <!-- Shadow -->
            <ellipse cx="80" cy="148" rx="42" ry="7" fill="rgba(232, 74, 111, 0.15)" class="mochi-shadow" />

            <!-- LEFT EAR -->
            <g class="mochi-ear ear-left" id="ear-left">
              <path d="M50,75 C35,25 45,5 60,15 C72,25 68,60 62,75 Z" fill="url(#mochi-body-grad)" stroke="#ffd1dc" stroke-width="1.8" />
              <path d="M52,65 C43,30 49,15 58,22 C65,30 63,55 58,68 Z" fill="url(#inner-ear-grad)" opacity="0.85" />
            </g>

            <!-- RIGHT EAR -->
            <g class="mochi-ear ear-right" id="ear-right">
              <path d="M110,75 C125,25 115,5 100,15 C88,25 92,60 98,75 Z" fill="url(#mochi-body-grad)" stroke="#ffd1dc" stroke-width="1.8" />
              <path d="M108,65 C117,30 111,15 102,22 C95,30 97,55 102,68 Z" fill="url(#inner-ear-grad)" opacity="0.85" />
            </g>

            <!-- BODY -->
            <path class="mochi-body" d="M80,50 C118,50 135,78 135,108 C135,138 116,146 80,146 C44,146 25,138 25,108 C25,78 42,50 80,50 Z" 
                  fill="url(#mochi-body-grad)" stroke="#ffccd5" stroke-width="1.8" />

            <!-- CHEEK BLUSH -->
            <ellipse cx="48" cy="112" rx="10" ry="6" fill="#ff758c" class="mochi-blush blush-left" opacity="0.55" />
            <ellipse cx="112" cy="112" rx="10" ry="6" fill="#ff758c" class="mochi-blush blush-right" opacity="0.55" />

            <!-- EYES CONTAINER -->
            <g id="mochi-eyes">
              <!-- Default sparkling eyes -->
              <g class="eye-set eye-default">
                <circle cx="56" cy="100" r="6.5" fill="#44273b" />
                <circle cx="54" cy="98" r="2.4" fill="#ffffff" />
                <circle cx="58" cy="102" r="1.2" fill="#ffffff" />

                <circle cx="104" cy="100" r="6.5" fill="#44273b" />
                <circle cx="102" cy="98" r="2.4" fill="#ffffff" />
                <circle cx="106" cy="102" r="1.2" fill="#ffffff" />
              </g>

              <!-- Happy / shy closed eyes ^ ^ -->
              <g class="eye-set eye-happy" style="display: none;">
                <path d="M48,103 Q56,92 64,103" stroke="#44273b" stroke-width="3.2" stroke-linecap="round" fill="none" />
                <path d="M96,103 Q104,92 112,103" stroke="#44273b" stroke-width="3.2" stroke-linecap="round" fill="none" />
              </g>

              <!-- Heart eyes (In love) -->
              <g class="eye-set eye-heart" style="display: none;">
                <path d="M56,97 C52,90 44,92 46,99 C48,105 56,110 56,110 C56,110 64,105 66,99 C68,92 60,90 56,97 Z" fill="#ff3366" class="pulsing-heart-eye" />
                <path d="M104,97 C100,90 92,92 94,99 C96,105 104,110 104,110 C104,110 112,105 114,99 C116,92 108,90 104,97 Z" fill="#ff3366" class="pulsing-heart-eye" />
              </g>

              <!-- Wide glistening eyes (Nervous / suspense) -->
              <g class="eye-set eye-nervous" style="display: none;">
                <circle cx="56" cy="99" r="8" fill="#44273b" />
                <circle cx="53" cy="96" r="3.2" fill="#ffffff" />
                <circle cx="58" cy="102" r="1.8" fill="#ffffff" />
                <circle cx="104" cy="99" r="8" fill="#44273b" />
                <circle cx="101" cy="96" r="3.2" fill="#ffffff" />
                <circle cx="106" cy="102" r="1.8" fill="#ffffff" />
                <!-- Sweat drop -->
                <path d="M120,86 C122,82 125,86 123,89 C121,91 119,89 120,86 Z" fill="#64b5f6" opacity="0.9" />
              </g>

              <!-- Winking eye -->
              <g class="eye-set eye-wink" style="display: none;">
                <circle cx="56" cy="100" r="6.5" fill="#44273b" />
                <circle cx="54" cy="98" r="2.4" fill="#ffffff" />
                <circle cx="58" cy="102" r="1.2" fill="#ffffff" />
                <path d="M96,102 Q104,92 112,102" stroke="#44273b" stroke-width="3.2" stroke-linecap="round" fill="none" />
              </g>
            </g>

            <!-- NOSE & MOUTH -->
            <!-- Little pink nose -->
            <ellipse cx="80" cy="105" rx="3.2" ry="2.2" fill="#ff758c" />
            
            <g id="mochi-mouth">
              <!-- Default cute w-mouth -->
              <path class="mouth-set mouth-default" d="M73,110 Q77,114 80,111 Q83,114 87,110" stroke="#44273b" stroke-width="2" stroke-linecap="round" fill="none" />
              <!-- Shy gentle smile -->
              <path class="mouth-set mouth-shy" d="M75,110 Q80,115 85,110" stroke="#44273b" stroke-width="2.2" stroke-linecap="round" fill="none" style="display: none;" />
              <!-- Open happy smile -->
              <path class="mouth-set mouth-happy" d="M74,109 Q80,119 86,109 Z" fill="#ff758c" stroke="#44273b" stroke-width="1.8" style="display: none;" />
              <!-- Nervous jittery small mouth -->
              <path class="mouth-set mouth-nervous" d="M76,112 Q80,110 84,112" stroke="#44273b" stroke-width="2.2" stroke-linecap="round" fill="none" style="display: none;" />
            </g>

            <!-- PROPS / PAWS -->
            <g id="mochi-props">
              <!-- Prop 1: Love letter (Default for intro) -->
              <g class="prop-set prop-letter">
                <rect x="68" y="118" width="24" height="17" rx="3" fill="#ffffff" stroke="#ff85a2" stroke-width="1.4" />
                <path d="M68,118 L80,127 L92,118" stroke="#ff85a2" stroke-width="1.4" fill="none" />
                <circle cx="80" cy="126" r="2.8" fill="#ff4d6d" />
                <!-- Paws holding letter -->
                <circle cx="66" cy="126" r="5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
                <circle cx="94" cy="126" r="5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
              </g>

              <!-- Prop 2: Glowing Heart (For love / Q5 / accepted) -->
              <g class="prop-set prop-heart" style="display: none;">
                <path d="M80,120 C74,110 60,112 64,124 C68,134 80,140 80,140 C80,140 92,134 96,124 C100,112 86,110 80,120 Z" 
                      fill="url(#heart-grad)" class="beating-prop-heart" />
                <circle cx="66" cy="127" r="5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
                <circle cx="94" cy="127" r="5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
              </g>

              <!-- Prop 3: Clasped paws under chin (Shy / Curious) -->
              <g class="prop-set prop-clasped" style="display: none;">
                <circle cx="72" cy="122" r="5.5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
                <circle cx="88" cy="122" r="5.5" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" />
              </g>

              <!-- Prop 4: Raised celebratory paws \ ^ o ^ / -->
              <g class="prop-set prop-celebrate" style="display: none;">
                <circle cx="36" cy="88" r="6" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" class="paw-wave-left" />
                <circle cx="124" cy="88" r="6" fill="#ffffff" stroke="#ffd1dc" stroke-width="1.4" class="paw-wave-right" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    `;

    this.speechTextEl = document.getElementById('mascot-speech-text');
    this.speechBubbleEl = document.getElementById('mascot-speech');
    this.avatarEl = document.getElementById('mascot-avatar');
  }

  bindEvents() {
    // Poke the mascot on tap / click
    if (this.avatarEl) {
      this.avatarEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.poke();
      });
    }
  }

  // Poke reaction
  poke() {
    if (window.soundManager) window.soundManager.playPop();

    // Spawn tiny heart particles
    if (window.canvasFX) {
      const rect = this.avatarEl.getBoundingClientRect();
      window.canvasFX.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    }

    // Squish animation
    this.avatarEl.classList.remove('squish-anim');
    void this.avatarEl.offsetWidth; // Force reflow
    this.avatarEl.classList.add('squish-anim');

    // Pick random cute quote
    const randomQuote = this.pokeQuotes[Math.floor(Math.random() * this.pokeQuotes.length)];
    this.setSpeech(randomQuote, false);

    // Briefly switch to happy/shy eyes
    this.switchEyes('happy');
    this.switchMouth('happy');
    this.setBlush(0.9);

    if (this.pokeTimeout) clearTimeout(this.pokeTimeout);
    this.pokeTimeout = setTimeout(() => {
      this.restoreMood();
    }, 2800);
  }

  // Set Speech Text with smooth fade
  setSpeech(text, saveAsDefault = true) {
    if (!this.speechTextEl || !this.speechBubbleEl) return;
    if (saveAsDefault) this.savedSpeech = text;

    this.speechBubbleEl.classList.add('bubble-pulse');
    this.speechTextEl.style.opacity = '0';

    setTimeout(() => {
      this.speechTextEl.textContent = text;
      this.speechTextEl.style.opacity = '1';
      setTimeout(() => {
        this.speechBubbleEl.classList.remove('bubble-pulse');
      }, 350);
    }, 150);
  }

  // Set Ear Tilt
  setEars(leftRot = 0, rightRot = 0) {
    const left = document.getElementById('ear-left');
    const right = document.getElementById('ear-right');
    if (left) left.style.transform = `rotate(${leftRot}deg)`;
    if (right) right.style.transform = `rotate(${rightRot}deg)`;
  }

  // Switch Eye Set: 'default', 'happy', 'heart', 'nervous', 'wink'
  switchEyes(type) {
    const sets = this.container.querySelectorAll('.eye-set');
    sets.forEach(el => el.style.display = 'none');
    const target = this.container.querySelector(`.eye-${type}`);
    if (target) target.style.display = 'inline';
  }

  // Switch Mouth: 'default', 'shy', 'happy', 'nervous'
  switchMouth(type) {
    const sets = this.container.querySelectorAll('.mouth-set');
    sets.forEach(el => el.style.display = 'none');
    const target = this.container.querySelector(`.mouth-${type}`);
    if (target) target.style.display = 'inline';
  }

  // Switch Prop: 'letter', 'heart', 'clasped', 'celebrate'
  switchProp(type) {
    const sets = this.container.querySelectorAll('.prop-set');
    sets.forEach(el => el.style.display = 'none');
    const target = this.container.querySelector(`.prop-${type}`);
    if (target) target.style.display = 'inline';
  }

  // Set Blush Intensity (0.3 to 1.0)
  setBlush(opacity = 0.55) {
    const blushes = this.container.querySelectorAll('.mochi-blush');
    blushes.forEach(b => b.style.opacity = opacity);
  }

  // Set Emotional Mood State
  setMood(moodName, customSpeech = '') {
    this.currentMood = moodName;
    this.savedMood = moodName;

    // Reset base ear rotation
    this.setEars(0, 0);

    switch (moodName) {
      case 'intro':
        this.switchEyes('default');
        this.switchMouth('default');
        this.switchProp('letter');
        this.setBlush(0.55);
        this.setEars(-3, 3);
        this.setSpeech(customSpeech || "Chào cậu! Tớ có vài câu hỏi muốn hỏi nè... 💌");
        break;

      case 'q1_curious': // Question 1: Cậu có đang thích ai không?
        this.switchEyes('default');
        this.switchMouth('shy');
        this.switchProp('clasped');
        this.setBlush(0.65);
        this.setEars(-12, 6); // Tilted curious head
        this.setSpeech(customSpeech || "Tò mò quá... Không biết cậu có đang thầm thương ai chưa ta? 👀🌸");
        break;

      case 'q2_shy': // Question 2: Nếu có người nói thích cậu...
        this.switchEyes('happy');
        this.switchMouth('shy');
        this.switchProp('clasped');
        this.setBlush(0.85); // Very blushy
        this.setEars(-6, -6);
        this.setSpeech(customSpeech || "Ngại ngùng ghê á! Nếu có người tỏ tình, cậu sẽ thấy sao nè? ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄");
        break;

      case 'q3_dreamy': // Question 3: Tìm hiểu một người đặc biệt
        this.switchEyes('wink');
        this.switchMouth('happy');
        this.switchProp('heart');
        this.setBlush(0.65);
        this.setEars(-4, 8);
        this.setSpeech(customSpeech || "Một người đặc biệt xuất hiện trong đời... lãng mạn ghê luôn đó! ✨🌱");
        break;

      case 'q4_suspense': // Question 4: Nếu người đó là người gửi website này?
        this.switchEyes('nervous');
        this.switchMouth('shy');
        this.switchProp('clasped');
        this.setBlush(0.85);
        this.setEars(-8, 8);
        this.setSpeech(customSpeech || "Ủa... nếu người đó chính là người gửi bức thư này thì sao ta? 🥺💓");
        break;

      case 'q5_nervous': // Question 5: CẬU CÓ THÍCH MÌNH KHÔNG?
        this.switchEyes('nervous');
        this.switchMouth('nervous');
        this.switchProp('heart');
        this.setBlush(0.95);
        this.setEars(6, -6);
        this.setSpeech(customSpeech || "Hồi hộp thót tim luôn á... Câu này quan trọng nhất nè cậu ơi! 🥺💗");
        break;

      case 'love_celebrate': // Result: Accepted
        this.switchEyes('heart');
        this.switchMouth('happy');
        this.switchProp('celebrate');
        this.setBlush(0.9);
        this.setEars(-10, 10);
        this.setSpeech(customSpeech || "OAAAA! Tụi mình có bí mật chung rồiiii! Yaaaaay! ❤️🎉");
        break;

      case 'sweet_interested': // Result: Interested
        this.switchEyes('happy');
        this.switchMouth('happy');
        this.switchProp('heart');
        this.setBlush(0.85);
        this.setEars(-5, 5);
        this.setSpeech(customSpeech || "Hehe vui quá đi! Vậy là có cơ hội cùng nhau rồi nè! 💗");
        break;

      case 'gentle_curious': // Result: Curious
        this.switchEyes('wink');
        this.switchMouth('shy');
        this.switchProp('clasped');
        this.setBlush(0.65);
        this.setSpeech(customSpeech || "Khởi đầu nhẹ nhàng thế này thật là tuyệt vời! ✨🌸");
        break;

      case 'warm_friend': // Result: Friendzone
        this.switchEyes('happy');
        this.switchMouth('shy');
        this.switchProp('letter');
        this.setBlush(0.5);
        this.setSpeech(customSpeech || "Cảm ơn cậu vì đã chân thành! Tớ vẫn luôn trân trọng cậu! 🤍");
        break;
    }
  }

  // Restore saved mood after hover or poke
  restoreMood() {
    this.setMood(this.savedMood, this.savedSpeech);
  }

  // Reaction when user hovers over an option button
  reactToHover(optionText, questionIndex) {
    const text = (optionText || '').toLowerCase();

    if (text.includes('có, mình thích') || text.includes('thích cậu!') || text.includes('vui lắm') || text.includes('có chứ')) {
      this.switchEyes('heart');
      this.switchMouth('happy');
      this.setBlush(0.9);
      this.setSpeech("Ái chà! Tim đập rộn ràng luôn rồiii nè! 😍❤️", false);
    } else if (text.includes('có một chút') || text.includes('ngại ngùng') || text.includes('cho người ấy cơ hội')) {
      this.switchEyes('happy');
      this.switchMouth('shy');
      this.setBlush(0.85);
      this.setSpeech("U là trời, ngại ngùng mà đáng yêu quá đi! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄", false);
    } else if (text.includes('tìm hiểu') || text.includes('thử') || text.includes('có lẽ là có')) {
      this.switchEyes('wink');
      this.switchMouth('happy');
      this.setBlush(0.65);
      this.setSpeech("Nghe hấp dẫn ghê á! Tớ cũng thấy hào hứng! ✨🌱", false);
    } else if (text.includes('chỉ xem là bạn') || text.includes('không muốn') || text.includes('chưa nghĩ đến')) {
      this.switchEyes('happy');
      this.switchMouth('shy');
      this.setBlush(0.5);
      this.setSpeech("Cậu cứ thoải mái chọn theo con tim nha! 🌸", false);
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.mochiMascot = new MochiMascot('mascot-container');
});

