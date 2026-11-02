/**
 * 💗 CRUSH QUIZ - One-click launcher
 * Chạy: node launch.js
 * Tự động: khởi động server + tạo public link qua localtunnel
 */

const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const PORT = 3000;
const DIR = __dirname;

// ─── Màu sắc terminal ─────────────────────────────────
const C = {
  pink:   '\x1b[35m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  bold:   '\x1b[1m',
  reset:  '\x1b[0m',
};

function log(msg) { console.log(msg); }
function ok(msg)  { log(`  ${C.green}✓${C.reset}  ${msg}`); }
function info(msg){ log(`  ${C.cyan}→${C.reset}  ${msg}`); }
function err(msg) { log(`  ${C.red}✗${C.reset}  ${msg}`); }
function box(lines) {
  const w = Math.max(...lines.map(l => stripAnsi(l).length)) + 4;
  const border = C.pink + '─'.repeat(w) + C.reset;
  log('\n' + border);
  lines.forEach(l => {
    const pad = w - 2 - stripAnsi(l).length;
    log(`${C.pink}│${C.reset} ${l}${' '.repeat(pad)} ${C.pink}│${C.reset}`);
  });
  log(border + '\n');
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// ─── Step 1: Start local server ──────────────────────
function startServer() {
  return new Promise((resolve) => {
    log('');
    log(`${C.bold}${C.pink}  💗  NGƯỜI ẤY CÓ THÍCH MÌNH KHÔNG? 💗${C.reset}`);
    log('');
    info('Đang khởi động server...');

    const srv = spawn(process.execPath, [path.join(DIR, 'server.js')], {
      cwd: DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    srv.stdout.on('data', d => {
      if (d.toString().includes('Server đang chạy')) {
        ok(`Server đang chạy tại ${C.cyan}http://localhost:${PORT}${C.reset}`);
        resolve(srv);
      }
    });

    srv.stderr.on('data', d => {
      const msg = d.toString().trim();
      if (msg) err('Server error: ' + msg);
    });

    // Fallback: assume ready after 2s
    setTimeout(() => resolve(srv), 2000);
  });
}

// ─── Step 2: Tunnel via localtunnel (npx) ────────────
function startTunnelLocaltunnel() {
  return new Promise((resolve, reject) => {
    info('Đang thử localtunnel... (tối đa 40 giây)');
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const lt = spawn(npxCmd, ['--yes', 'localtunnel', '--port', String(PORT)], {
      cwd: DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    lt.on('error', (e) => reject(new Error('npx error: ' + e.message)));

    function tryParse(data) {
      const line = data.toString();
      const match = line.match(/your url is:\s*(https?:\/\/\S+)/i)
                 || line.match(/(https?:\/\/[a-z0-9-]+\.loca\.lt)/i);
      if (match) resolve({ url: match[1].trim(), proc: lt, service: 'localtunnel' });
    }
    lt.stdout.on('data', tryParse);
    lt.stderr.on('data', tryParse);

    setTimeout(() => { try { lt.kill(); } catch(e){} reject(new Error('localtunnel timeout')); }, 40000);
  });
}

// ─── Step 2b: Tunnel via serveo.net (SSH, zero-install) ──
function startTunnelServeo() {
  return new Promise((resolve, reject) => {
    info('Đang thử serveo.net (SSH)... (tối đa 20 giây)');
    // Windows 10/11 có sẵn OpenSSH client
    const ssh = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=30',
      '-R', `80:localhost:${PORT}`,
      'serveo.net'
    ], { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'], shell: false });

    ssh.on('error', (e) => reject(new Error('ssh not found: ' + e.message)));

    function tryParse(data) {
      const line = data.toString();
      const match = line.match(/(https?:\/\/[a-z0-9]+\.serveo\.net)/i);
      if (match) resolve({ url: match[1].trim(), proc: ssh, service: 'serveo' });
    }
    ssh.stdout.on('data', tryParse);
    ssh.stderr.on('data', tryParse);

    setTimeout(() => { try { ssh.kill(); } catch(e){} reject(new Error('serveo timeout')); }, 20000);
  });
}

// ─── Step 2c: Tunnel via localhost.run (SSH) ──────────
function startTunnelLocalhostRun() {
  return new Promise((resolve, reject) => {
    info('Đang thử localhost.run (SSH)... (tối đa 20 giây)');
    const ssh = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ServerAliveInterval=30',
      '-R', `80:localhost:${PORT}`,
      'nokey@localhost.run'
    ], { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'], shell: false });

    ssh.on('error', (e) => reject(new Error('ssh not found: ' + e.message)));

    function tryParse(data) {
      const line = data.toString();
      const match = line.match(/(https?:\/\/[a-z0-9-]+\.localhost\.run)/i)
                 || line.match(/tunneled.*?(https?:\/\/\S+)/i);
      if (match) resolve({ url: match[1].trim(), proc: ssh, service: 'localhost.run' });
    }
    ssh.stdout.on('data', tryParse);
    ssh.stderr.on('data', tryParse);

    setTimeout(() => { try { ssh.kill(); } catch(e){} reject(new Error('localhost.run timeout')); }, 20000);
  });
}

// ─── Thử lần lượt các tunnel ─────────────────────────
async function startTunnel() {
  const methods = [
    startTunnelLocaltunnel,
    startTunnelServeo,
    startTunnelLocalhostRun,
  ];
  for (const method of methods) {
    try {
      const result = await method();
      ok(`Tunnel thành công qua: ${result.service}`);
      return result;
    } catch (e) {
      err(e.message + ' — thử phương án khác...');
    }
  }
  throw new Error('Tất cả tunnel đều thất bại');
}

// ─── Step 3: Open browser ────────────────────────────
function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'start' :
               process.platform === 'darwin' ? 'open' : 'xdg-open';
  try {
    spawn(cmd, [url], { shell: true, stdio: 'ignore', detached: true }).unref();
  } catch (e) {}
}

// ─── Main ─────────────────────────────────────────────
async function main() {
  try {
    const serverProc = await startServer();

    let tunnelUrl, tunnelProc;
    try {
      ({ url: tunnelUrl, proc: tunnelProc } = await startTunnel());
    } catch (e) {
      err('Không tạo được tunnel tự động.');
      log('');
      log(`  ${C.yellow}══════════════════════════════════════════════${C.reset}`);
      log(`  ${C.bold}Server vẫn đang chạy tại localhost:3000${C.reset}`);
      log(`  ${C.yellow}Để tạo link công khai, mở CMD mới và chạy:${C.reset}`);
      log(`  ${C.cyan}  npx localtunnel --port 3000${C.reset}`);
      log(`  ${C.yellow}══════════════════════════════════════════════${C.reset}`);
      log('');
      log(`  Nhấn ${C.bold}Ctrl+C${C.reset} để dừng server.\n`);
      // Giữ server sống, không exit
      process.on('SIGINT', () => {
        log('\n\n  💗 Đã dừng. Cảm ơn và chúc bạn thành công! 🌸\n');
        if (serverProc) serverProc.kill();
        process.exit(0);
      });
      return; // Dừng hàm nhưng không thoát process
    }

    ok(`Tunnel đã sẵn sàng!`);

    const crushLink = `${tunnelUrl}/?to=TênCrush&from=TênBạn`;
    const adminLink = `${tunnelUrl}/admin`;

    box([
      `${C.bold}${C.pink}🔗 LINK GỬI CRUSH:${C.reset}`,
      `   ${C.cyan}${C.bold}${tunnelUrl}${C.reset}`,
      ``,
      `${C.bold}💡 LINK CÓ TÊN (tuỳ chọn):${C.reset}`,
      `   ${C.cyan}${crushLink}${C.reset}`,
      ``,
      `${C.bold}${C.pink}🔐 XEM KẾT QUẢ BÍ MẬT:${C.reset}`,
      `   ${C.cyan}${adminLink}${C.reset}  ${C.yellow}(PIN: 1314)${C.reset}`,
      ``,
      `${C.yellow}⚠️  Giữ cửa sổ này MỞ trong khi crush làm bài!${C.reset}`,
    ]);

    // Auto-open admin in browser
    openBrowser(adminLink);

    log(`  Nhấn ${C.bold}Ctrl+C${C.reset} để dừng khi crush đã xong.\n`);

    // Keep alive & handle exit
    process.on('SIGINT', () => {
      log('\n\n  💗 Đã dừng. Cảm ơn và chúc bạn thành công! 🌸\n');
      if (tunnelProc) tunnelProc.kill();
      if (serverProc) serverProc.kill();
      process.exit(0);
    });

  } catch (e) {
    err('Lỗi: ' + e.message);
    process.exit(1);
  }
}

main();

