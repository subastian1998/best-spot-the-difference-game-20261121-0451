// render.js — draws every screen on the single canvas.
// The scenes themselves are pre-rendered by main.js into two offscreen
// canvases (left = base, right = all 7 differences); this file draws the
// frame, HUD, markers, buttons and overlays around them.

import { GAME, LEVELS, PANEL, UI, VIEW } from './config.js';
import { remainingCount, starsFor } from './world.js';

function text(ctx, str, x, y, font, fill, align = 'left', baseline = 'alphabetic') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

function button(ctx, rect, label, opts = {}) {
  const { fill = '#ffffff', ink = UI.ink, font = UI.fontMed, border = UI.ink } = opts;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = border;
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1, font, ink, 'center', 'middle');
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Button rectangles for the current screen, so input.js can hit-test them. */
export function layoutButtons(app) {
  const btns = [];
  if (app.screen === 'play' || app.screen === 'win') {
    btns.push({ id: 'hint', x: 30, y: 628, w: 190, h: 52 });
    btns.push({ id: 'sound', x: 236, y: 628, w: 190, h: 52 });
    btns.push({ id: 'menu', x: 442, y: 628, w: 190, h: 52 });
  }
  if (app.screen === 'win') {
    btns.push({ id: 'next', x: 400, y: 500, w: 220, h: 56 });
    btns.push({ id: 'replay', x: 660, y: 500, w: 220, h: 56 });
  }
  if (app.screen === 'select') {
    LEVELS.forEach((level, i) => {
      btns.push({ id: `level-${i}`, x: 90 + i * 390, y: 300, w: 330, h: 300 });
    });
    btns.push({ id: 'howto', x: 490, y: 648, w: 300, h: 52 });
  }
  return btns;
}

function drawHeader(ctx, app) {
  ctx.fillStyle = '#22303c';
  ctx.fillRect(0, 0, VIEW.width, HEADER_H);
  text(ctx, '🔍  CARI BEDANYA!', 30, 46, UI.fontTitle, '#ffd23e');
  text(ctx, 'Spot the Difference  •  3 adegan asli  •  7 perbedaan tiap level', 30, 74, UI.fontSmall, '#cfe3ef');
  if (app.screen === 'play' && app.level) {
    const lv = app.level;
    text(ctx, `⏱ ${formatTime(lv.elapsedMs)}`, 700, 46, UI.fontBig, '#ffffff', 'left');
    text(ctx, `⭐ Skor ${lv.score}`, 700, 76, UI.fontSmall, '#ffd23e', 'left');
    // remaining counter — big and unmissable
    const rem = remainingCount(lv);
    ctx.beginPath();
    ctx.roundRect(1020, 14, 230, 64, 14);
    ctx.fillStyle = rem === 0 ? '#1f9d55' : '#e8632c';
    ctx.fill();
    text(ctx, rem === 0 ? '🎉 SEMUA KETEMU!' : `Tersisa: ${rem}/7`, 1135, 47, UI.fontBig, '#ffffff', 'center', 'middle');
  } else if (app.screen === 'win' && app.level) {
    text(ctx, `⭐ Skor total ${app.totalScore}`, 700, 46, UI.fontBig, '#ffd23e');
  }
}

const HEADER_H = 92;

function drawPanelFrame(ctx, x, label, accent) {
  ctx.beginPath();
  ctx.roundRect(x - 6, PANEL.y - 6, PANEL.width + 12, PANEL.height + 12, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = UI.panelBorder;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(x - 6, PANEL.y - 6, PANEL.width + 12, 34, [14, 14, 0, 0]);
  ctx.fillStyle = accent;
  ctx.fill();
  text(ctx, label, x + 14, PANEL.y + 17, UI.fontMed, '#ffffff', 'left', 'middle');
}

function drawMarker(ctx, x, y, r, nowMs, popAt) {
  const pop = popAt ? Math.min(1, (nowMs - popAt) / 450) : 1;
  const rr = r * (0.6 + 0.4 * pop);
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.75 * pop;
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#1f9d55';
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, rr + 4, 0, Math.PI * 2);
  ctx.stroke();
  // check mark
  ctx.strokeStyle = '#1f9d55';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - rr * 0.45, y);
  ctx.lineTo(x - rr * 0.12, y + rr * 0.38);
  ctx.lineTo(x + rr * 0.5, y - rr * 0.38);
  ctx.stroke();
  ctx.restore();
}

function drawPlay(ctx, app, nowMs) {
  const lv = app.level;
  const accent = lv.level.accent;
  drawPanelFrame(ctx, PANEL.leftX, 'A  •  Gambar Asli', accent);
  drawPanelFrame(ctx, PANEL.rightX, 'B  •  Gambar Beda', accent);
  const innerY = PANEL.y + 34;
  ctx.drawImage(app.sceneLeft, PANEL.leftX, innerY);
  ctx.drawImage(app.sceneRight, PANEL.rightX, innerY);

  // markers on both panels for every found difference
  for (const id of lv.foundOrder) {
    const d = lv.diffs.find((x) => x.id === id);
    const popAt = lv.popDiff === id ? lv.popAt : 0;
    drawMarker(ctx, PANEL.leftX + d.x, innerY + d.y, d.r, nowMs, popAt);
    drawMarker(ctx, PANEL.rightX + d.x, innerY + d.y, d.r, nowMs, popAt);
  }
  // hint pulse: a pulsing ring around one unfound difference, both panels
  if (lv.hint && nowMs < lv.hint.untilMs) {
    const d = lv.diffs.find((x) => x.id === lv.hint.diffId);
    const pulse = 1 + 0.18 * Math.sin(nowMs / 130);
    for (const px of [PANEL.leftX, PANEL.rightX]) {
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#f5b301';
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(px + d.x, innerY + d.y, d.r * pulse + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  // wrong-click flash
  if (lv.wrongPos && nowMs - lv.wrongAt < GAME.wrongFlashMs) {
    const a = 1 - (nowMs - lv.wrongAt) / GAME.wrongFlashMs;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#d92b2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(lv.wrongPos.px, lv.wrongPos.py, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lv.wrongPos.px - 12, lv.wrongPos.py - 12);
    ctx.lineTo(lv.wrongPos.px + 12, lv.wrongPos.py + 12);
    ctx.moveTo(lv.wrongPos.px + 12, lv.wrongPos.py - 12);
    ctx.lineTo(lv.wrongPos.px - 12, lv.wrongPos.py + 12);
    ctx.stroke();
    ctx.restore();
    text(ctx, 'Bukan itu!  −25', lv.wrongPos.px, lv.wrongPos.py - 34, UI.fontMed, '#d92b2b', 'center');
  }
  // footer buttons + instructions
  const btns = layoutButtons(app);
  const hintBtn = btns.find((b) => b.id === 'hint');
  button(ctx, hintBtn, `💡 Petunjuk (${lv.hintsLeft})`, { fill: lv.hintsLeft > 0 ? '#ffe98a' : '#dfe6ea' });
  const soundBtn = btns.find((b) => b.id === 'sound');
  button(ctx, soundBtn, app.muted ? '🔇 Suara: Mati' : '🔊 Suara: Nyala', { fill: '#ffffff' });
  const menuBtn = btns.find((b) => b.id === 'menu');
  button(ctx, menuBtn, '🏠 Pilih Level', { fill: '#ffffff' });
  text(ctx, 'Klik perbedaan di gambar A atau B  •  Panah = gerakkan kursor, Enter = tandai  •  H = petunjuk', 30, 712, UI.fontSmall, UI.inkSoft);
  text(ctx, `${lv.level.name}  •  Level ${lv.levelIndex + 1}/3`, 30, 744, UI.fontSmall, UI.inkSoft);
  // level progress dots
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.arc(1180 + i * 30, 728, 9, 0, Math.PI * 2);
    ctx.fillStyle = i < lv.levelIndex ? '#1f9d55' : i === lv.levelIndex ? LEVELS[i].accent : '#c8d2d8';
    ctx.fill();
  }
  // keyboard cursor
  if (app.cursor.visible) {
    ctx.save();
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(app.cursor.x, app.cursor.y, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(app.cursor.x - 24, app.cursor.y);
    ctx.lineTo(app.cursor.x + 24, app.cursor.y);
    ctx.moveTo(app.cursor.x, app.cursor.y - 24);
    ctx.lineTo(app.cursor.x, app.cursor.y + 24);
    ctx.stroke();
    ctx.restore();
  }
}

function drawSelect(ctx, app) {
  text(ctx, 'Pilih Level', 640, 150, '700 44px "Trebuchet MS", "Segoe UI", sans-serif', UI.ink, 'center');
  text(ctx, 'Dua gambar hampir sama. Temukan 7 perbedaan di tiap level!', 640, 192, UI.fontMed, UI.inkSoft, 'center');
  LEVELS.forEach((level, i) => {
    const x = 90 + i * 390;
    const y = 300;
    const w = 330;
    const h = 300;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = level.accent;
    ctx.stroke();
    // mini preview: a real render of this level's scene, scaled down
    if (app.thumbs && app.thumbs[i]) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 14, y + 14, w - 28, 130, 10);
      ctx.clip();
      ctx.drawImage(app.thumbs[i], x + 14, y + 14, w - 28, 130);
      ctx.restore();
      ctx.beginPath();
      ctx.roundRect(x + 14, y + 14, w - 28, 130, 10);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(34,48,60,0.35)';
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(x + 14, y + 14, w - 28, 130, 10);
      ctx.fillStyle = level.accent;
      ctx.fill();
    }
    text(ctx, `Level ${i + 1}`, x + w / 2, y + 182, UI.fontSmall, level.accent, 'center');
    text(ctx, level.name, x + w / 2, y + 220, UI.fontBig, UI.ink, 'center');
    text(ctx, level.sub, x + w / 2, y + 250, UI.fontSmall, UI.inkSoft, 'center');
    text(ctx, '7 perbedaan  •  3 petunjuk', x + w / 2, y + 278, UI.fontSmall, UI.inkSoft, 'center');
  });
  const howto = layoutButtons(app).find((b) => b.id === 'howto');
  button(ctx, howto, '❓ Cara Main', { fill: '#ffe98a' });
  text(ctx, 'Skor total: ' + app.totalScore, 640, 760, UI.fontSmall, UI.inkSoft, 'center');
  if (app.showHowto) {
    ctx.fillStyle = 'rgba(34,48,60,0.55)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.beginPath();
    ctx.roundRect(340, 180, 600, 380, 18);
    ctx.fillStyle = '#fff8ec';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = UI.ink;
    ctx.stroke();
    text(ctx, 'Cara Main', 640, 240, UI.fontBig, UI.ink, 'center');
    const lines = [
      '• Bandingkan gambar A (kiri) dan B (kanan).',
      '• Klik / ketuk perbedaan yang kamu temukan.',
      '• Perbedaan yang ketemu dilingkari hijau ✓.',
      '• Tiap perbedaan = +100 poin, klik salah = −25.',
      '• Tombol 💡 memberi petunjuk (3x per level, −50).',
      '• Keyboard: panah gerakkan kursor, Enter tandai.',
      '• Temukan ketujuh perbedaan sebelum waktumu habis!',
    ];
    lines.forEach((line, i) => text(ctx, line, 380, 292 + i * 34, UI.fontMed, UI.ink));
    text(ctx, 'Klik di mana saja untuk menutup', 640, 524, UI.fontSmall, UI.inkSoft, 'center');
  }
}

function drawWin(ctx, app, nowMs) {
  drawPlay(ctx, { ...app, screen: 'play' }, nowMs);
  ctx.fillStyle = 'rgba(34,48,60,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.beginPath();
  ctx.roundRect(330, 120, 620, 500, 22);
  ctx.fillStyle = '#fff8ec';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = UI.gold;
  ctx.stroke();
  const lv = app.level;
  const stars = starsFor(lv);
  text(ctx, '🎉 Level Selesai!', 640, 190, '700 40px "Trebuchet MS", "Segoe UI", sans-serif', UI.ink, 'center');
  text(ctx, lv.level.name, 640, 232, UI.fontBig, lv.level.accent, 'center');
  let starStr = '';
  for (let i = 0; i < 3; i += 1) starStr += i < stars ? '★' : '☆';
  text(ctx, starStr, 640, 300, '64px "Trebuchet MS", sans-serif', UI.gold, 'center');
  text(ctx, `Waktu: ${formatTime(lv.finishMs)}`, 640, 360, UI.fontMed, UI.ink, 'center');
  text(ctx, `Bonus waktu: +${lv.timeBonus ?? 0}`, 640, 392, UI.fontMed, UI.ink, 'center');
  text(ctx, `Skor level: ${lv.score}`, 640, 424, UI.fontMed, UI.ink, 'center');
  text(ctx, `Skor total: ${app.totalScore}`, 640, 456, UI.fontBig, UI.ink, 'center');
  const btns = layoutButtons(app);
  const nextBtn = btns.find((b) => b.id === 'next');
  const replayBtn = btns.find((b) => b.id === 'replay');
  const isLast = lv.levelIndex >= LEVELS.length - 1;
  button(ctx, nextBtn, isLast ? '🏠 Pilih Level' : '➡️ Level Berikutnya', { fill: '#1f9d55', ink: '#ffffff', border: '#1f9d55' });
  button(ctx, replayBtn, '🔄 Main Lagi', { fill: '#ffffff' });
  text(ctx, 'Semua 7 perbedaan ketemu — kerja bagus!', 640, 592, UI.fontSmall, UI.inkSoft, 'center');
}

export function draw(ctx, app, nowMs) {
  ctx.fillStyle = UI.paper;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  drawHeader(ctx, app);
  if (app.screen === 'select') drawSelect(ctx, app);
  else if (app.screen === 'play') drawPlay(ctx, app, nowMs);
  else if (app.screen === 'win') drawWin(ctx, app, nowMs);
}
