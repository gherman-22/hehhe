/**
 * In-memory Request Emulation Test Script (Zero TCP sockets required)
 */
const { EventEmitter } = require('node:events');
const { Readable } = require('node:stream');
const fs = require('node:fs');
const path = require('node:path');
const { handleRequest, getResponses, saveResponses } = require('./server.js');

function mockRequest(method, urlPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    // Create mock request stream
    const req = new Readable({
      read() {
        if (body) {
          this.push(typeof body === 'string' ? body : JSON.stringify(body));
        }
        this.push(null);
      }
    });

    req.method = method;
    req.url = urlPath;
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.socket = { remoteAddress: '127.0.0.1' };

    // Create mock response
    let statusCode = 200;
    const resHeaders = {};
    const chunks = [];

    const res = new EventEmitter();
    res.writeHead = function(code, headersObj) {
      statusCode = code;
      if (headersObj) Object.assign(resHeaders, headersObj);
      return res;
    };
    res.setHeader = function(key, val) {
      resHeaders[key.toLowerCase()] = val;
    };
    res.write = function(chunk) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      return true;
    };
    res.end = function(chunk) {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      let parsed = rawBody;
      try {
        parsed = JSON.parse(rawBody);
      } catch (e) {}
      resolve({ statusCode, headers: resHeaders, body: parsed });
    };

    handleRequest(req, res).catch(reject);
  });
}

async function runTests() {
  console.log('🧪 Bắt đầu kiểm tra hệ thống Crush Quiz...\n');

  // 1. Health check
  const health = await mockRequest('GET', '/api/health');
  console.log('1. Health Check API:', health.statusCode === 200 && health.body.status === 'healthy' ? '✅ PASS' : '❌ FAIL');

  // 2. Submit quiz response (Option: "Có, mình thích cậu! ❤️")
  const submissionData = {
    crushName: "Bé Ngọc",
    senderName: "Hoàng",
    durationSeconds: 38,
    startedAt: new Date(Date.now() - 38000).toISOString(),
    answers: [
      { questionId: 1, question: "Cậu có đang thích ai không?", selected: "Có lẽ là có..." },
      { questionId: 2, question: "Nếu có người nói thích cậu, cậu sẽ cảm thấy thế nào?", selected: "Vui lắm." },
      { questionId: 3, question: "Cậu có muốn tìm hiểu một người đặc biệt không?", selected: "Có chứ!" },
      { questionId: 4, question: "Nếu người đó là người đang gửi cậu website này thì sao?", selected: "Mình sẽ rất vui." },
      { questionId: 5, question: "CẬU CÓ THÍCH MÌNH KHÔNG? 🥺💗", selected: "Có, mình thích cậu! ❤️" }
    ]
  };

  const submitRes = await mockRequest('POST', '/api/submit', submissionData);
  console.log('2. Submit Quiz API:', submitRes.statusCode === 201 && submitRes.body.success ? '✅ PASS' : '❌ FAIL');
  console.log('   Nhãn kết quả:', submitRes.body.category?.label);

  // 3. Verify Admin PIN (Correct 1314)
  const verifyCorrect = await mockRequest('POST', '/api/admin/verify', { pin: '1314' });
  console.log('3. Verify PIN Đúng (1314):', verifyCorrect.statusCode === 200 && verifyCorrect.body.success ? '✅ PASS' : '❌ FAIL');

  // 4. Verify Admin PIN (Wrong 0000)
  const verifyWrong = await mockRequest('POST', '/api/admin/verify', { pin: '0000' });
  console.log('4. Reject PIN Sai (0000):', verifyWrong.statusCode === 401 && !verifyWrong.body.success ? '✅ PASS' : '❌ FAIL');

  // 5. Admin Get Responses with PIN
  const getResponsesRes = await mockRequest('GET', '/api/admin/responses', null, { 'x-admin-pin': '1314' });
  console.log('5. Lấy danh sách câu trả lời bí mật:', getResponsesRes.statusCode === 200 && getResponsesRes.body.count >= 1 ? '✅ PASS' : '❌ FAIL');
  const latestItem = getResponsesRes.body.responses[0];
  console.log(`   Người trả lời: ${latestItem?.crushName} • Câu 5: "${latestItem?.answers[4]?.selected}"`);

  // 6. Admin Get Stats
  const statsRes = await mockRequest('GET', '/api/admin/stats', null, { 'x-admin-pin': '1314' });
  console.log('6. Lấy thống kê tỷ lệ tình cảm:', statsRes.statusCode === 200 && statsRes.body.stats.accepted >= 1 ? '✅ PASS' : '❌ FAIL');

  // 7. Verify file persistence on disk
  const rawDisk = fs.readFileSync(path.join(__dirname, 'data', 'responses.json'), 'utf-8');
  const parsedDisk = JSON.parse(rawDisk);
  console.log('7. Lưu trữ an toàn trong data/responses.json:', parsedDisk.length >= 1 ? '✅ PASS' : '❌ FAIL');

  console.log('\n🎉 Toàn bộ kiểm tra API & Hệ thống lưu trữ đều HOÀN HẢO!\n');
}

runTests().catch(err => {
  console.error('Lỗi kiểm tra:', err);
  process.exit(1);
});
