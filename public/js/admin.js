/**
 * NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗
 * Admin Portal Logic - Secret Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const authScreen = document.getElementById('auth-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const pinInput = document.getElementById('admin-pin-input');
  const btnUnlock = document.getElementById('btn-unlock');
  const pinError = document.getElementById('pin-error');

  const btnRefresh = document.getElementById('btn-refresh');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnChangePin = document.getElementById('btn-change-pin');
  const btnLogout = document.getElementById('btn-logout');

  const statTotal = document.getElementById('stat-total');
  const statAccepted = document.getElementById('stat-accepted');
  const statInterested = document.getElementById('stat-interested');
  const statCurious = document.getElementById('stat-curious');
  const statFriendzone = document.getElementById('stat-friendzone');
  const countBadge = document.getElementById('response-count-badge');
  const responsesList = document.getElementById('responses-list');

  // Change PIN Modal Elements
  const changePinModal = document.getElementById('change-pin-modal');
  const btnClosePinModal = document.getElementById('btn-close-pin-modal');
  const inputNewPin = document.getElementById('input-new-pin');
  const inputConfirmPin = document.getElementById('input-confirm-pin');
  const btnSaveNewPin = document.getElementById('btn-save-new-pin');
  const changePinMsg = document.getElementById('change-pin-msg');

  let currentPin = sessionStorage.getItem('crush_admin_pin') || '';
  let cachedResponses = [];

  // Check existing session
  if (currentPin) {
    verifyAndLogin(currentPin, false);
  }

  // Handle Login Click
  btnUnlock.addEventListener('click', () => {
    const pin = pinInput.value.trim();
    if (!pin) {
      pinError.textContent = 'Vui lòng nhập mã PIN!';
      return;
    }
    verifyAndLogin(pin, true);
  });

  pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnUnlock.click();
    }
  });

  // Verify PIN with server
  async function verifyAndLogin(pin, showError = true) {
    try {
      btnUnlock.disabled = true;
      if (showError) pinError.textContent = 'Đang kiểm tra mã PIN...';

      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await res.json();
      btnUnlock.disabled = false;

      if (res.ok && data.success) {
        currentPin = pin;
        sessionStorage.setItem('crush_admin_pin', pin);
        authScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadResponses();
      } else {
        sessionStorage.removeItem('crush_admin_pin');
        if (showError) {
          pinError.textContent = data.message || 'Mã PIN không đúng!';
          pinInput.focus();
        }
      }
    } catch (err) {
      btnUnlock.disabled = false;
      if (showError) pinError.textContent = 'Không thể kết nối đến máy chủ!';
    }
  }

  // Logout
  btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('crush_admin_pin');
    currentPin = '';
    dashboardScreen.style.display = 'none';
    authScreen.style.display = 'block';
    pinInput.value = '';
    pinError.textContent = '';
  });

  // Load responses from server
  async function loadResponses() {
    try {
      responsesList.innerHTML = '<div class="empty-state">Đang tải dữ liệu phản hồi...</div>';

      const res = await fetch('/api/admin/responses', {
        headers: { 'x-admin-pin': currentPin }
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          btnLogout.click();
          return;
        }
        throw new Error('Lỗi tải dữ liệu');
      }

      const data = await res.json();
      cachedResponses = data.responses || [];

      renderStats(cachedResponses);
      renderList(cachedResponses);
    } catch (err) {
      console.error(err);
      responsesList.innerHTML = '<div class="empty-state" style="color: #d32f2f;">Lỗi tải dữ liệu. Vui lòng thử lại!</div>';
    }
  }

  // Render Stats Cards
  function renderStats(list) {
    const total = list.length;
    const accepted = list.filter(r => r.resultCategory?.code === 'accepted').length;
    const interested = list.filter(r => r.resultCategory?.code === 'interested').length;
    const curious = list.filter(r => r.resultCategory?.code === 'curious').length;
    const friendzone = list.filter(r => r.resultCategory?.code === 'friendzone').length;

    statTotal.textContent = total;
    statAccepted.textContent = accepted;
    statInterested.textContent = interested;
    statCurious.textContent = curious;
    statFriendzone.textContent = friendzone;
    countBadge.textContent = total;
  }

  // Render Response List
  function renderList(list) {
    if (list.length === 0) {
      responsesList.innerHTML = `
        <div class="empty-state">
          <div style="font-size: 3rem; margin-bottom: 10px;">💌</div>
          <p style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 6px;">
            Chưa có câu trả lời nào!
          </p>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">
            Hãy gửi đường link website cho người ấy và quay lại đây để xem điều bất ngờ nhé! 🌸
          </p>
        </div>
      `;
      return;
    }

    responsesList.innerHTML = '';
    list.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'response-card';

      const dateStr = formatDateTime(item.completedAt);
      const timeTakenStr = formatDuration(item.durationSeconds);
      const category = item.resultCategory || { label: 'Khác', badge: 'badge-other' };

      // Highlight Question 5 Answer
      const q5 = item.answers?.find(a => a.questionId === 5);
      const q5Text = q5 ? q5.selected : 'Chưa rõ';

      // Build question breakdown
      let answersHtml = '';
      if (Array.isArray(item.answers)) {
        answersHtml = item.answers.map(a => `
          <div class="answer-row">
            <span class="q-text">Câu ${a.questionId}: ${escapeHtml(a.question)}</span>
            <span class="a-selected">👉 ${escapeHtml(a.selected)}</span>
          </div>
        `).join('');
      }

      card.innerHTML = `
        <div class="response-header">
          <div class="crush-meta">
            <h3>💌 Gửi tới: <strong>${escapeHtml(item.crushName || 'Người ấy')}</strong> (từ: ${escapeHtml(item.senderName || 'Người gửi')})</h3>
            <span class="time-tag">🕒 ${dateStr} • Làm trong ${timeTakenStr}</span>
          </div>
          <span class="${category.badge || 'badge-love'}">
            ${escapeHtml(category.label || q5Text)}
          </span>
        </div>

        <div style="margin: 12px 0 8px; font-weight: 700; color: var(--primary-pink-dark); font-size: 1.05rem;">
          Câu hỏi quan trọng nhất: "${escapeHtml(q5Text)}"
        </div>

        <details>
          <summary style="cursor: pointer; color: var(--primary-pink); font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">
            Xem chi tiết toàn bộ 5 câu trả lời 📋
          </summary>
          <div class="answers-breakdown">
            ${answersHtml}
          </div>
        </details>

        <div class="card-footer">
          <button class="btn-action" onclick="copySummary('${item.id}')">
            📋 Sao chép tóm tắt
          </button>
          <button class="btn-action btn-delete" onclick="deleteResponse('${item.id}')">
            🗑️ Xóa
          </button>
        </div>
      `;

      responsesList.appendChild(card);
    });
  }

  // Delete single response
  window.deleteResponse = async (id) => {
    if (!confirm('Cậu có chắc chắn muốn xóa câu trả lời này không?')) return;

    try {
      const res = await fetch(`/api/admin/responses/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': currentPin }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        loadResponses();
      } else {
        alert(data.message || 'Lỗi khi xóa câu trả lời');
      }
    } catch (err) {
      alert('Không thể kết nối đến máy chủ');
    }
  };

  // Copy Summary to Clipboard
  window.copySummary = (id) => {
    const item = cachedResponses.find(r => r.id === id);
    if (!item) return;

    const summary = [
      `💌 KẾT QUẢ TRẮC NGHIỆM TÌNH YÊU 💗`,
      `• Người trả lời: ${item.crushName}`,
      `• Người gửi: ${item.senderName}`,
      `• Thời gian: ${formatDateTime(item.completedAt)}`,
      `• Câu trả lời quan trọng nhất: ${item.answers?.find(a => a.questionId === 5)?.selected || 'N/A'}`,
      `---`,
      ...(item.answers || []).map(a => `Câu ${a.questionId} (${a.question}): ${a.selected}`)
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      alert('✓ Đã sao chép tóm tắt câu trả lời vào bộ nhớ tạm!');
    }).catch(() => {
      prompt('Sao chép nội dung bên dưới:', summary);
    });
  };

  // Clear All Responses
  btnClearAll.addEventListener('click', async () => {
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ các câu trả lời không? Hành động này không thể hoàn tác!')) return;

    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: { 'x-admin-pin': currentPin }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Đã xóa toàn bộ câu trả lời.');
        loadResponses();
      } else {
        alert(data.message || 'Lỗi xóa dữ liệu');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ');
    }
  });

  // Refresh
  btnRefresh.addEventListener('click', () => {
    loadResponses();
  });

  // Export to CSV with UTF-8 BOM (for Excel support)
  btnExportCsv.addEventListener('click', () => {
    if (cachedResponses.length === 0) {
      alert('Chưa có dữ liệu để xuất file!');
      return;
    }

    const headers = ['ID', 'Thời gian', 'Thời gian làm', 'Người ấy (Crush)', 'Người gửi', 'Câu 1', 'Câu 2', 'Câu 3', 'Câu 4', 'Câu 5 (Quan trọng)', 'Kết luận'];
    const rows = cachedResponses.map(r => {
      const a = r.answers || [];
      return [
        r.id,
        formatDateTime(r.completedAt),
        `${r.durationSeconds}s`,
        `"${(r.crushName || '').replace(/"/g, '""')}"`,
        `"${(r.senderName || '').replace(/"/g, '""')}"`,
        `"${(a[0]?.selected || '').replace(/"/g, '""')}"`,
        `"${(a[1]?.selected || '').replace(/"/g, '""')}"`,
        `"${(a[2]?.selected || '').replace(/"/g, '""')}"`,
        `"${(a[3]?.selected || '').replace(/"/g, '""')}"`,
        `"${(a[4]?.selected || '').replace(/"/g, '""')}"`,
        `"${(r.resultCategory?.label || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ket_qua_crush_quiz_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Change PIN modal handlers
  btnChangePin.addEventListener('click', () => {
    changePinModal.classList.add('active');
    inputNewPin.value = '';
    inputConfirmPin.value = '';
    changePinMsg.textContent = '';
  });

  btnClosePinModal.addEventListener('click', () => {
    changePinModal.classList.remove('active');
  });

  btnSaveNewPin.addEventListener('click', async () => {
    const newPin = inputNewPin.value.trim();
    const confirmPin = inputConfirmPin.value.trim();

    if (!newPin || newPin.length < 4) {
      changePinMsg.style.color = '#d32f2f';
      changePinMsg.textContent = 'Mã PIN mới phải có ít nhất 4 ký tự!';
      return;
    }
    if (newPin !== confirmPin) {
      changePinMsg.style.color = '#d32f2f';
      changePinMsg.textContent = 'Hai mã PIN không trùng khớp!';
      return;
    }

    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': currentPin
        },
        body: JSON.stringify({ newPin })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        currentPin = newPin;
        sessionStorage.setItem('crush_admin_pin', newPin);
        changePinMsg.style.color = '#2e7d32';
        changePinMsg.textContent = '✓ Đã đổi mã PIN thành công!';
        setTimeout(() => {
          changePinModal.classList.remove('active');
        }, 1200);
      } else {
        changePinMsg.style.color = '#d32f2f';
        changePinMsg.textContent = data.message || 'Lỗi khi đổi mã PIN';
      }
    } catch (err) {
      changePinMsg.style.color = '#d32f2f';
      changePinMsg.textContent = 'Lỗi kết nối máy chủ';
    }
  });

  // Date & Duration formatters
  function formatDateTime(isoString) {
    if (!isoString) return 'Chưa rõ';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' +
             d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return isoString;
    }
  }

  function formatDuration(sec) {
    sec = Number(sec) || 0;
    if (sec < 60) return `${sec} giây`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} phút ${s} giây`;
  }

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

