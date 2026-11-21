// main.js — bootstrap + game loop for "Cari Bedanya!".
// Owns the app object: screen, level state, pre-rendered scene canvases,
// cursor, mute flag and total score. The loop ticks the timer and redraws
// every frame; input.js feeds it marks and button presses.

import { LEVELS, PANEL, VIEW } from './config.js';
import { createLevel, drawScene, remainingCount, tryMark, useHint, SCENE_H, SCENE_W } from './world.js';
import { draw } from './render.js';
import { attachInput } from './input.js';
import { setMuted, sfx } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const app = {
  screen: 'select',
  level: null,
  sceneLeft: null,
  sceneRight: null,
  cursor: { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + 260, visible: false },
  muted: false,
  totalScore: 0,
  showHowto: false,
  startedAt: 0,
};

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}

function renderScenes(levelId) {
  const left = document.createElement('canvas');
  left.width = SCENE_W;
  left.height = SCENE_H;
  drawScene(left.getContext('2d'), levelId, false);
  const right = document.createElement('canvas');
  right.width = SCENE_W;
  right.height = SCENE_H;
  drawScene(right.getContext('2d'), levelId, true);
  app.sceneLeft = left;
  app.sceneRight = right;
}

/** Small real-scene thumbnails for the level-select cards. */
function buildThumbs() {
  app.thumbs = LEVELS.map((level) => {
    const full = document.createElement('canvas');
    full.width = SCENE_W;
    full.height = SCENE_H;
    drawScene(full.getContext('2d'), level.id, false);
    const thumb = document.createElement('canvas');
    thumb.width = 302;
    thumb.height = 130;
    const tctx = thumb.getContext('2d');
    tctx.drawImage(full, 0, 40, SCENE_W, 390, 0, 0, 302, 130);
    return thumb;
  });
}

app.startLevel = function startLevel(index) {
  const lv = createLevel(index);
  lv.startedAt = performance.now();
  app.level = lv;
  app.screen = 'play';
  app.cursor = { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + 260, visible: false };
  renderScenes(lv.level.id);
  announce(`${lv.level.name}: temukan 7 perbedaan. Tersisa 7 dari 7.`);
};

app.toMenu = function toMenu() {
  app.screen = 'select';
  app.level = null;
  app.showHowto = false;
};

function announce(msg) {
  statusEl.textContent = msg;
}

function onMark(sx, sy, px, py) {
  const lv = app.level;
  if (!lv || app.screen !== 'play') return;
  const result = tryMark(lv, sx, sy, performance.now());
  if (result === 'found') {
    sfx.found();
    announce(`Ketemu! ${lv.found.size} dari 7. Tersisa ${remainingCount(lv)}.`);
    if (lv.finished) {
      app.totalScore += lv.score;
      app.screen = 'win';
      sfx.win();
      announce(`Level selesai! Skor ${lv.score}. Skor total ${app.totalScore}.`);
    }
  } else if (result === 'wrong') {
    lv.wrongPos = { px, py };
    sfx.wrong();
    announce(`Bukan itu. Tersisa ${remainingCount(lv)}.`);
  }
}

function onButton(id) {
  const lv = app.level;
  if (id === 'hint') {
    if (app.screen !== 'play' || !lv) return;
    const diff = useHint(lv, performance.now());
    if (diff) {
      sfx.hint();
      announce(`Petunjuk: lihat lingkaran kuning. Tersisa ${remainingCount(lv)}.`);
    }
    return;
  }
  if (id === 'sound') {
    app.muted = !app.muted;
    setMuted(app.muted);
    if (!app.muted) sfx.click();
    return;
  }
  if (id === 'menu') {
    sfx.click();
    app.toMenu();
    return;
  }
  if (id === 'howto') {
    app.showHowto = true;
    sfx.click();
    return;
  }
  if (id === 'replay' && lv) {
    sfx.select();
    app.startLevel(lv.levelIndex);
    return;
  }
  if (id === 'next' && lv) {
    sfx.select();
    if (lv.levelIndex >= LEVELS.length - 1) app.toMenu();
    else app.startLevel(lv.levelIndex + 1);
    return;
  }
  if (id.startsWith('level-')) {
    const index = Number(id.slice('level-'.length));
    if (Number.isInteger(index) && index >= 0 && index < LEVELS.length) {
      sfx.select();
      app.startLevel(index);
    }
  }
}

attachInput(canvas, app, { onMark, onButton });

function tick(nowMs) {
  const lv = app.level;
  if (lv && app.screen === 'play' && !lv.finished) {
    lv.elapsedMs = nowMs - lv.startedAt;
  }
  draw(ctx, app, nowMs);
  requestAnimationFrame(tick);
}

function boot() {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  buildThumbs();
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (shot) {
    stageShot(app, shot, performance.now());
    // Freeze the timer for screenshots: the staged elapsed time is fixed.
    if (app.level) app.level.startedAt = performance.now() - app.level.elapsedMs;
  } else {
    app.toMenu();
  }
  requestAnimationFrame(tick);
  // Expose a tiny hook for automated play-tests (no network, same page).
  window.__game = app;
}

boot();
