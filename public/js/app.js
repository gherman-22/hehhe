/**
 * NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗
 * Main Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const introScreen = document.getElementById('screen-intro');
  const quizScreen = document.getElementById('screen-quiz');
  const resultScreen = document.getElementById('screen-result');

  const btnStart = document.getElementById('btn-start');
  const btnPrev = document.getElementById('btn-prev');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const btnShare = document.getElementById('btn-share');
  const btnCreateLink = document.getElementById('btn-create-link');
  const btnAdmin = document.getElementById('btn-admin');

  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const questionNumberBadge = document.getElementById('question-number-badge');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');

  const resultTitle = document.getElementById('result-title');
  const resultQuote = document.getElementById('result-quote');
  const resultDesc = document.getElementById('result-desc');
  const submissionStatus = document.getElementById('submission-status');
  const introGreeting = document.getElementById('intro-greeting');
  const introSenderNote = document.getElementById('intro-sender-note');

  // Modal Elements
  const linkModal = document.getElementById('link-modal');
  const closeModalBtn = document.getElementById('btn-close-modal');
  const inputTo = document.getElementById('input-to');
  const inputFrom = document.getElementById('input-from');
  const btnGenerateLink = document.getElementById('btn-generate-link');
  const linkOutputBox = document.getElementById('link-output-box');
  const btnCopyLink = document.getElementById('btn-copy-link');

  // URL Query Parameters Parsing (?to=...&from=...)
  const urlParams = new URLSearchParams(window.location.search);
  const crushName = urlParams.get('to') || urlParams.get('crush') || '';
  const senderName = urlParams.get('from') || urlParams.get('sender') || '';

  // Questions Database
  const questions = [
    {
      id: 1,
      badge: "Câu hỏi 1 / 5",
      question: "Cậu có đang thích ai không?",
      options: [
        { text: "Có.", icon: "✨" },
        { text: "Không.", icon: "🍃" },
        { text: "Có lẽ là có...", icon: "🌸" }
      ]
    },
    {
      id: 2,
      badge: "Câu hỏi 2 / 5",
      question: "Nếu có người nói thích cậu, cậu sẽ cảm thấy thế nào?",
      options: [
        { text: "Vui lắm.", icon: "🥰" },
        { text: "Ngại ngùng.", icon: "🙈" },
        { text: "Bình thường.", icon: "😌" },
        { text: "Tùy người đó là ai.", icon: "🤔" }
      ]
    },
    {
      id: 3,
      badge: "Câu hỏi 3 / 5",
      question: "Nói thật cậu có cảm tình với mình không?",
      options: [
        { text: "Có chứ!", icon: "💖" },
        { text: "Cũng muốn thử.", icon: "🌱" },
        { text: "Chưa nghĩ đến.", icon: "☁️" },
        { text: "Không muốn.", icon: "🍂" }
      ]
    },
    {
      id: 4,
      badge: "Câu hỏi 4 / 5",
      question: "Nhưng mà... tao đell có tiền lắm mày ạ?",
      options: [
        { text: "Không quan trọng :))", icon: "💌" },
        { text: "Thì thôi.", icon: "🥲" },
        { text: "Ok chúng ta là bạn.", icon: "🤝" },
        { text: "Không xứng :)))", icon: "😂" }
      ]
    },
    {
      id: 5,
      badge: "Câu hỏi cuối cùng... 💗",
      subtitle: "Đây là câu hỏi quan trọng nhất...",
      question: "CẬU CÓ THÍCH MÌNH KHÔNG? 🥺💗",
      isKeyQuestion: true,
      options: [
        { text: "Có, mình thích cậu! ❤️", icon: "❤️", category: "accepted" },
        { text: "Có một chút...", icon: "💗", category: "interested" },
        { text: "Mình muốn tìm hiểu cậu thêm.", icon: "✨", category: "curious" },
        { text: "Xin lỗi, mình chỉ xem cậu là bạn.", icon: "🤍", category: "friendzone" }
      ]
    }
  ];

  // App State
  let currentQuestionIndex = 0;
  const userAnswers = [];
  let startTime = null;

  // Personalize greeting if custom link is provided
  if (crushName) {
    introGreeting.innerHTML = `Xin chào <span class="crush-highlight">${escapeHtml(crushName)}</span>! 💗`;
  }
  if (senderName) {
    introSenderNote.textContent = `Thư gửi từ: ${senderName} 💌`;
    introSenderNote.style.display = 'inline-flex';
  }

  // Audio Toggle
  btnAudioToggle.addEventListener('click', () => {
    const isPlaying = window.soundManager.toggleMusic();
    btnAudioToggle.textContent = isPlaying ? '🎶' : '🎵';
    btnAudioToggle.classList.toggle('playing', isPlaying);
    btnAudioToggle.title = isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền lãng mạn';
    if (isPlaying && window.SONG_INFO) {
      const infoEl = document.getElementById('lyric-song-info');
      if (infoEl) infoEl.textContent = `♪ ${window.SONG_INFO.title} · ${window.SONG_INFO.artist}`;
    }
  });

  // Start Quiz
  btnStart.addEventListener('click', (e) => {
    startTime = new Date();
    window.soundManager.playPop();

    // Trigger burst on start
    if (window.canvasFX) {
      window.canvasFX.burst(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, 14);
    }

    // Try auto-start gentle bgm if user interacted
    if (!window.soundManager.isPlayingMusic) {
      const started = window.soundManager.toggleMusic();
      if (started) {
        btnAudioToggle.textContent = '🎶';
        btnAudioToggle.classList.add('playing');
        // Populate song info strip
        if (window.SONG_INFO) {
          const infoEl = document.getElementById('lyric-song-info');
          if (infoEl) infoEl.textContent = `♪ ${window.SONG_INFO.title} · ${window.SONG_INFO.artist}`;
        }
      }
    }

    introScreen.style.display = 'none';
    quizScreen.style.display = 'block';

    // Move mascot to quiz slot
    const mascotEl = document.getElementById('mascot-container');
    const quizSlot = document.getElementById('mascot-slot-quiz');
    if (mascotEl && quizSlot) quizSlot.appendChild(mascotEl);

    loadQuestion(0);
  });

  // Load question into view
  function loadQuestion(index) {
    currentQuestionIndex = index;
    const q = questions[index];

    // Update Progress
    const percent = Math.round(((index + 1) / questions.length) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `Câu ${index + 1}/${questions.length}`;
    questionNumberBadge.textContent = q.badge;

    // Update text
    questionText.textContent = q.question;
    if (q.isKeyQuestion) {
      questionText.classList.add('highlight-q5');
    } else {
      questionText.classList.remove('highlight-q5');
    }

    // Update Mascot Mood per Question
    if (window.mochiMascot) {
      const moods = ['q1_curious', 'q2_shy', 'q3_dreamy', 'q4_suspense', 'q5_nervous'];
      window.mochiMascot.setMood(moods[index] || 'q1_curious');
    }

    // Previous button state (disabled on first question)
    btnPrev.disabled = index === 0;

    // Render Options
    optionsContainer.innerHTML = '';
    const previousSelection = userAnswers[index]?.selected;

    q.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      if (previousSelection === opt.text) {
        btn.classList.add('selected');
      }

      btn.innerHTML = `
        <span class="option-label">${escapeHtml(opt.text)}</span>
        <span class="option-icon">${opt.icon || '🌸'}</span>
      `;

      // Hover feedback for emotional mascot reaction
      btn.addEventListener('mouseenter', () => {
        if (window.mochiMascot) window.mochiMascot.reactToHover(opt.text, index);
      });
      btn.addEventListener('mouseleave', () => {
        if (window.mochiMascot) window.mochiMascot.restoreMood();
      });

      btn.addEventListener('click', (e) => {
        handleOptionSelect(index, opt, btn, e);
      });

      optionsContainer.appendChild(btn);
    });

    // Scroll top smooth
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle Option Click
  function handleOptionSelect(qIndex, option, btnElement, event) {
    window.soundManager.playPop();

    // Spawn canvas heart burst at button location
    const rect = btnElement.getBoundingClientRect();
    const burstX = rect.left + rect.width / 2;
    const burstY = rect.top + rect.height / 2;
    if (window.canvasFX) {
      window.canvasFX.burst(burstX, burstY, qIndex === 4 ? 20 : 12);
    }

    // Visual selection highlight
    const allBtns = optionsContainer.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');

    // Record answer
    userAnswers[qIndex] = {
      questionId: questions[qIndex].id,
      question: questions[qIndex].question,
      selected: option.text,
      category: option.category || null,
      timestamp: new Date().toISOString()
    };

    // Smooth delay before advancing so user sees selection feedback
    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        loadQuestion(qIndex + 1);
      } else {
        finishQuiz();
      }
    }, 380);
  }

  // Back Button
  btnPrev.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
      window.soundManager.playTap();
      loadQuestion(currentQuestionIndex - 1);
    }
  });

  // Finish Quiz & Submit
  async function finishQuiz() {
    quizScreen.style.display = 'none';
    resultScreen.style.display = 'block';

    // Move mascot to result slot
    const mascotEl = document.getElementById('mascot-container');
    const resultSlot = document.getElementById('mascot-slot-result');
    if (mascotEl && resultSlot) resultSlot.appendChild(mascotEl);

    const endTime = new Date();
    const durationSeconds = Math.round((endTime - (startTime || endTime)) / 1000);

    // Play celebration audio and confetti
    window.soundManager.playCelebration();
    if (window.canvasFX) {
      window.canvasFX.startCelebration();
    }

    // Determine message and mascot reaction based on Question 5 answer
    const q5Answer = userAnswers[4]?.selected || '';
    let quoteText = '';
    let descText = '';

    if (q5Answer.includes('Có, mình thích') || q5Answer.includes('thích cậu!')) {
      quoteText = '“Có vẻ như chúng ta có một bí mật chung rồi! ❤️”';
      descText = 'Thật hạnh phúc khi biết tình cảm này không chỉ đến từ một phía. Cảm ơn cậu vì đã mở lòng và cho cả hai một cơ hội ngọt ngào!';
      if (window.mochiMascot) window.mochiMascot.setMood('love_celebrate', 'OAAA! Tụi mình có bí mật chung rồiii! Hạnh phúc quá điii! ❤️🎉');
    } else if (q5Answer.includes('Có một chút')) {
      quoteText = '“Vậy mình có thể từ từ tìm hiểu nhau nhé! 💗”';
      descText = 'Một chút rung động cũng là khởi đầu cho những điều tuyệt vời nhất. Cảm ơn cậu đã chia sẻ thật lòng!';
      if (window.mochiMascot) window.mochiMascot.setMood('sweet_interested', 'Hehe vui quá đi! Vậy là có cơ hội cùng nhau rồi nè! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄');
    } else if (q5Answer.includes('tìm hiểu')) {
      quoteText = '“Một khởi đầu nhẹ nhàng cũng rất tuyệt!”';
      descText = 'Mọi câu chuyện đẹp đều bắt đầu từ những bước đi chậm rãi và chân thành. Hy vọng chúng ta sẽ có thật nhiều kỷ niệm đáng nhớ!';
      if (window.mochiMascot) window.mochiMascot.setMood('gentle_curious', 'Khởi đầu nhẹ nhàng thế này thật là tuyệt vời! ✨🌸');
    } else {
      quoteText = '“Cảm ơn cậu vì đã thành thật. Mình vẫn trân trọng cậu!”';
      descText = 'Sự chân thành luôn là điều đáng quý nhất. Cảm ơn cậu đã tham gia bài trắc nghiệm này, chúc cậu luôn bình yên và vui vẻ nhé! 🌸';
      if (window.mochiMascot) window.mochiMascot.setMood('warm_friend', 'Cảm ơn cậu vì đã chân thành! Tớ vẫn luôn trân trọng cậu! 🤍');
    }

    resultQuote.textContent = quoteText;
    resultDesc.textContent = descText;

    // Send payload to backend
    const payload = {
      crushName: crushName || 'Người ấy',
      senderName: senderName || 'Người gửi',
      answers: userAnswers,
      durationSeconds,
      startedAt: (startTime || new Date()).toISOString()
    };

    // Save to LocalStorage first (offline guarantee)
    try {
      const localHistory = JSON.parse(localStorage.getItem('crush_quiz_history') || '[]');
      localHistory.push(payload);
      localStorage.setItem('crush_quiz_history', JSON.stringify(localHistory));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Post to Server API
    try {
      submissionStatus.innerHTML = `
        <span class="status-badge" style="background:#fff3e0; color:#e65100; border-color:#ffe0b2;">
          ⏳ Đang gửi kết quả bí mật về cho người ấy...
        </span>
      `;

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        submissionStatus.innerHTML = `
          <span class="status-badge">
            ✓ Đã gửi câu trả lời về cho người ấy thành công 💌
          </span>
        `;
      } else {
        throw new Error(data.message || 'Lỗi gửi kết quả');
      }
    } catch (err) {
      console.warn('Backend submit fallback:', err);
      submissionStatus.innerHTML = `
        <span class="status-badge">
          ✓ Đã lưu câu trả lời an toàn trên thiết bị này! 💌
        </span>
      `;
    }
  }

  // Link Generator & Customizer Modal
  function openLinkModal() {
    linkModal.classList.add('active');
    inputTo.value = crushName;
    inputFrom.value = senderName;
    updateGeneratedLink();
  }

  function closeLinkModal() {
    linkModal.classList.remove('active');
  }

  function updateGeneratedLink() {
    const to = encodeURIComponent(inputTo.value.trim());
    const from = encodeURIComponent(inputFrom.value.trim());
    const base = window.location.origin + window.location.pathname;
    let url = base;
    const params = [];
    if (to) params.push(`to=${to}`);
    if (from) params.push(`from=${from}`);
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    linkOutputBox.textContent = url;
    return url;
  }

  if (btnCreateLink) btnCreateLink.addEventListener('click', openLinkModal);
  if (btnShare) btnShare.addEventListener('click', openLinkModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeLinkModal);

  linkModal.addEventListener('click', (e) => {
    if (e.target === linkModal) closeLinkModal();
  });

  inputTo.addEventListener('input', updateGeneratedLink);
  inputFrom.addEventListener('input', updateGeneratedLink);

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', async () => {
      const url = updateGeneratedLink();
      try {
        await navigator.clipboard.writeText(url);
        btnCopyLink.textContent = '✓ Đã sao chép đường link!';
        btnCopyLink.style.background = '#2e7d32';
        setTimeout(() => {
          btnCopyLink.textContent = '📋 Sao chép đường link';
          btnCopyLink.style.background = '';
        }, 2200);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Đã sao chép đường link!');
      }
    });
  }

  // Admin access
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      window.location.href = '/admin';
    });
  }

  // Utility to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});

