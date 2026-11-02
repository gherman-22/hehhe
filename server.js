/**
 * NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗
 * Modern Backend Server (Node.js Built-in HTTP)
 * Zero external dependencies - Runs natively & blazing fast!
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp'
};

// Helpers for Data Access
function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      const defaultSettings = { adminPin: '1314', createdDate: new Date().toISOString() };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Lỗi đọc settings:', err);
    return { adminPin: '1314' };
  }
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Lỗi lưu settings:', err);
    return false;
  }
}

function getResponses() {
  try {
    if (!fs.existsSync(RESPONSES_FILE)) {
      fs.writeFileSync(RESPONSES_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(RESPONSES_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Lỗi đọc responses:', err);
    return [];
  }
}

function saveResponses(responses) {
  try {
    fs.writeFileSync(RESPONSES_FILE, JSON.stringify(responses, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Lỗi ghi responses:', err);
    return false;
  }
}

// Parse request body helper
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // 2MB max
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// JSON response helper
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Serve static files
function serveStaticFile(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found - Trang không tồn tại');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

// Categorize Q5 result for quick badges & analytics
function categorizeQ5(answer) {
  if (!answer) return 'unknown';
  const text = answer.toLowerCase();
  if (text.includes('có, mình thích') || text.includes('thích cậu!')) {
    return { code: 'accepted', label: 'Crush đồng ý thích! ❤️', badge: 'badge-love', sentiment: '100% Match' };
  }
  if (text.includes('có một chút') || text.includes('chút cảm tình')) {
    return { code: 'interested', label: 'Có chút cảm tình 💗', badge: 'badge-interested', sentiment: '75% Match' };
  }
  if (text.includes('tìm hiểu')) {
    return { code: 'curious', label: 'Muốn tìm hiểu thêm ✨', badge: 'badge-curious', sentiment: '50% Match' };
  }
  if (text.includes('chỉ xem là bạn') || text.includes('bạn bè')) {
    return { code: 'friendzone', label: 'Xem là bạn tốt 🤝', badge: 'badge-friendzone', sentiment: 'Friendzone' };
  }
  return { code: 'other', label: answer, badge: 'badge-other', sentiment: 'Khác' };
}

// Request handler logic
async function handleRequest(req, res) {
  const reqUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = reqUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-pin, Authorization'
    });
    res.end();
    return;
  }

  // API Endpoints
  // 1. Health check
  if (pathname === '/api/health' && method === 'GET') {
    return sendJSON(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
  }

  // 2. Submit quiz response
  if (pathname === '/api/submit' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const { crushName, senderName, answers, durationSeconds, startedAt } = body;

      if (!Array.isArray(answers) || answers.length === 0) {
        return sendJSON(res, 400, { success: false, message: 'Dữ liệu câu trả lời không hợp lệ.' });
      }

      const q5Answer = answers.find(a => a.questionId === 5)?.selected || '';
      const category = categorizeQ5(q5Answer);

      const submission = {
        id: 'res_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
        crushName: (crushName || 'Người ấy').trim().slice(0, 50),
        senderName: (senderName || 'Người gửi').trim().slice(0, 50),
        answers,
        resultCategory: category,
        durationSeconds: Number(durationSeconds) || 0,
        startedAt: startedAt || new Date().toISOString(),
        completedAt: new Date().toISOString(),
        clientIp: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      };

      const responses = getResponses();
      responses.unshift(submission); // Newest first
      saveResponses(responses);

      return sendJSON(res, 201, {
        success: true,
        message: 'Đã lưu câu trả lời thành công!',
        id: submission.id,
        category: submission.resultCategory
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      return sendJSON(res, 500, { success: false, message: 'Lỗi máy chủ khi lưu kết quả.' });
    }
  }

  // Admin PIN verification helper
  const authPin = req.headers['x-admin-pin'] || reqUrl.searchParams.get('pin');
  const verifyAdmin = () => {
    const settings = getSettings();
    return authPin && authPin.toString().trim() === settings.adminPin.toString().trim();
  };

  // 3. Admin PIN check
  if (pathname === '/api/admin/verify' && method === 'POST') {
    try {
      const body = await parseBody(req);
      const inputPin = (body.pin || '').toString().trim();
      const settings = getSettings();

      if (inputPin === settings.adminPin.toString().trim()) {
        return sendJSON(res, 200, { success: true, message: 'Xác thực thành công!' });
      } else {
        return sendJSON(res, 401, { success: false, message: 'Mã PIN không chính xác! Hãy kiểm tra lại.' });
      }
    } catch (err) {
      return sendJSON(res, 500, { success: false, message: 'Lỗi xác thực' });
    }
  }

  // 4. Admin - Get all responses
  if (pathname === '/api/admin/responses' && method === 'GET') {
    if (!verifyAdmin()) {
      return sendJSON(res, 401, { success: false, message: 'Truy cập bị từ chối: Cần mã PIN quản trị' });
    }
    const responses = getResponses();
    return sendJSON(res, 200, {
      success: true,
      count: responses.length,
      responses
    });
  }

  // 5. Admin - Get stats summary
  if (pathname === '/api/admin/stats' && method === 'GET') {
    if (!verifyAdmin()) {
      return sendJSON(res, 401, { success: false, message: 'Truy cập bị từ chối' });
    }
    const responses = getResponses();
    const stats = {
      total: responses.length,
      accepted: responses.filter(r => r.resultCategory?.code === 'accepted').length,
      interested: responses.filter(r => r.resultCategory?.code === 'interested').length,
      curious: responses.filter(r => r.resultCategory?.code === 'curious').length,
      friendzone: responses.filter(r => r.resultCategory?.code === 'friendzone').length,
      latestTime: responses.length > 0 ? responses[0].completedAt : null
    };
    return sendJSON(res, 200, { success: true, stats });
  }

  // 6. Admin - Delete single response
  if (pathname.startsWith('/api/admin/responses/') && method === 'DELETE') {
    if (!verifyAdmin()) {
      return sendJSON(res, 401, { success: false, message: 'Truy cập bị từ chối' });
    }
    const targetId = pathname.replace('/api/admin/responses/', '').trim();
    let responses = getResponses();
    const initialLen = responses.length;
    responses = responses.filter(r => r.id !== targetId);

    if (responses.length === initialLen) {
      return sendJSON(res, 404, { success: false, message: 'Không tìm thấy câu trả lời này.' });
    }
    saveResponses(responses);
    return sendJSON(res, 200, { success: true, message: 'Đã xóa câu trả lời thành công!' });
  }

  // 7. Admin - Delete all responses
  if (pathname === '/api/admin/clear' && method === 'POST') {
    if (!verifyAdmin()) {
      return sendJSON(res, 401, { success: false, message: 'Truy cập bị từ chối' });
    }
    saveResponses([]);
    return sendJSON(res, 200, { success: true, message: 'Đã xóa toàn bộ dữ liệu phản hồi!' });
  }

  // 8. Admin - Change PIN
  if (pathname === '/api/admin/change-pin' && method === 'POST') {
    if (!verifyAdmin()) {
      return sendJSON(res, 401, { success: false, message: 'Mã PIN hiện tại không đúng' });
    }
    try {
      const body = await parseBody(req);
      const newPin = (body.newPin || '').toString().trim();
      if (!newPin || newPin.length < 4) {
        return sendJSON(res, 400, { success: false, message: 'Mã PIN mới phải có ít nhất 4 ký tự.' });
      }
      const settings = getSettings();
      settings.adminPin = newPin;
      saveSettings(settings);
      return sendJSON(res, 200, { success: true, message: 'Đã đổi mã PIN thành công!' });
    } catch (err) {
      return sendJSON(res, 500, { success: false, message: 'Lỗi đổi PIN' });
    }
  }

  // Static File Routing
  let requestedPath = pathname;
  if (requestedPath === '/' || requestedPath === '') {
    requestedPath = '/index.html';
  } else if (requestedPath === '/admin') {
    requestedPath = '/admin.html';
  }

  // Prevent directory traversal
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure filePath is inside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('403 Forbidden');
    return;
  }

  serveStaticFile(res, filePath);
}

// HTTP Server
const server = http.createServer(handleRequest);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`💗  NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗`);
    console.log(`🚀  Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🔐  Trang quản trị câu trả lời: http://localhost:${PORT}/admin`);
    console.log(`🔑  Mã PIN quản trị mặc định: 1314`);
    console.log(`======================================================\n`);
  });
}

module.exports = {
  server,
  handleRequest,
  getSettings,
  saveSettings,
  getResponses,
  saveResponses
};
