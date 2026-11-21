// world.js — the three original scenes and the level rules.
// Every scene is drawn procedurally on canvas (no image assets). Each scene
// has exactly 7 differences: drawScene(ctx, id, false) draws the left
// picture, drawScene(ctx, id, true) draws the right picture with all 7
// changes baked in. DIFFS gives the click target of each difference in
// scene coordinates (580 x 470).

import { GAME, LEVELS } from './config.js';

export const SCENE_W = 580;
export const SCENE_H = 470;

// ---- small drawing helpers -------------------------------------------------
function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}
function rrect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}
function cloud(ctx, x, y, s, fill = '#ffffff') {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 15 * s, 0, Math.PI * 2);
  ctx.arc(x + 40 * s, y, 17 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y + 6 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();
}
function sun(ctx, x, y, r, rays) {
  if (rays) {
    ctx.strokeStyle = '#f5b301';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
      ctx.lineTo(x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18));
      ctx.stroke();
    }
  }
  circle(ctx, x, y, r, '#ffd23e');
  circle(ctx, x, y, r - 7, '#ffe98a');
}
function bird(ctx, x, y, s = 1) {
  ctx.strokeStyle = '#33414d';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 9 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 9 * s, x + 12 * s, y);
  ctx.stroke();
}

// ---- Scene 1: Pasar Pagi (morning market) ----------------------------------
function drawPasar(ctx, variant) {
  // sky + distant rooftops
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(1, '#dff3fb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  sun(ctx, 88, 66, 30, !variant); // diff 1: sun loses its rays
  cloud(ctx, 300, 60, 1);
  cloud(ctx, 470, 96, 0.8);
  if (!variant) bird(ctx, 210, 58); // diff 2: bird in the sky
  bird(ctx, 250, 84, 0.8);
  ctx.fillStyle = '#b98a5e';
  ctx.fillRect(0, 252, SCENE_W, 48);
  ctx.fillStyle = '#a4713f';
  ctx.fillRect(40, 236, 120, 20);
  ctx.fillRect(420, 228, 130, 28);
  // bunting flags across the top
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.quadraticCurveTo(290, 52, SCENE_W, 14);
  ctx.stroke();
  const flagCols = ['#e8632c', '#f5b301', '#2f9e5f', '#3a7bd5'];
  for (let i = 0; i < 14; i += 1) {
    const t = i / 13;
    const x = 20 + t * 540;
    const y = 18 + Math.sin(t * Math.PI) * 26;
    ctx.fillStyle = flagCols[i % 4];
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.lineTo(x + 9, y);
    ctx.lineTo(x, y + 18);
    ctx.closePath();
    ctx.fill();
  }
  // ground
  ctx.fillStyle = '#e8c99a';
  ctx.fillRect(0, 300, SCENE_W, 170);
  ctx.fillStyle = '#d9b47e';
  for (let x = 0; x < SCENE_W; x += 58) ctx.fillRect(x, 300, 3, 170);

  // left stall: striped awning
  const awn = variant ? '#3a7bd5' : '#e8632c'; // diff 3: awning red -> blue
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? awn : '#fff8ec';
    ctx.beginPath();
    ctx.moveTo(48 + i * 34, 158);
    ctx.lineTo(48 + (i + 1) * 34, 158);
    ctx.lineTo(48 + (i + 1) * 34 + 8, 196);
    ctx.lineTo(48 + i * 34 + 8, 196);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(52, 196, 6, 130);
  ctx.fillRect(244, 196, 6, 130);
  // counter + fruit piles
  rrect(ctx, 40, 318, 224, 26, 6, '#8a5a2b');
  rrect(ctx, 40, 344, 224, 60, 6, '#6e4520');
  const fruitCol = variant ? '#7bc043' : '#f58220'; // diff 4: oranges -> green apples
  for (let i = 0; i < 9; i += 1) {
    circle(ctx, 78 + (i % 5) * 30, 306 - Math.floor(i / 5) * 22, 13, fruitCol);
  }
  for (let i = 0; i < 7; i += 1) circle(ctx, 176 + (i % 4) * 24, 310 - Math.floor(i / 4) * 20, 12, '#d92b2b');
  for (let i = 0; i < 5; i += 1) ellipse(ctx, 232 + (i % 3) * 12, 312 - Math.floor(i / 3) * 12, 8, 13, '#ffe135');
  // vendor behind the stall
  circle(ctx, 300, 238, 26, '#f2c89b'); // head
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(300, 238, 26, 0, Math.PI);
  ctx.fill();
  const hatCol = variant ? '#d92b2b' : '#e8c33c'; // diff 5: straw hat -> red hat
  ctx.fillStyle = hatCol;
  ctx.beginPath();
  ctx.ellipse(300, 220, 42, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(300, 218, 20, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#22303c';
  circle(ctx, 292, 238, 3, '#22303c');
  circle(ctx, 308, 238, 3, '#22303c');
  ctx.strokeStyle = '#22303c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(300, 246, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  rrect(ctx, 272, 262, 56, 62, 10, '#2f9e5f'); // shirt
  // right stall: green awning, baskets, cat
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2f9e5f' : '#fff8ec';
    ctx.beginPath();
    ctx.moveTo(360 + i * 36, 168);
    ctx.lineTo(360 + (i + 1) * 36, 168);
    ctx.lineTo(360 + (i + 1) * 36 + 8, 204);
    ctx.lineTo(360 + i * 36 + 8, 204);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(364, 204, 6, 126);
  ctx.fillRect(532, 204, 6, 126);
  rrect(ctx, 352, 322, 196, 24, 6, '#8a5a2b');
  rrect(ctx, 352, 346, 196, 58, 6, '#6e4520');
  for (let i = 0; i < 8; i += 1) circle(ctx, 392 + (i % 4) * 28, 312 - Math.floor(i / 4) * 20, 12, '#8e44ad');
  for (let i = 0; i < 6; i += 1) circle(ctx, 500 + (i % 3) * 20, 314 - Math.floor(i / 3) * 18, 10, '#e8632c');
  if (!variant) {
    // diff 6: cat sitting on the right stall
    ctx.fillStyle = '#f5a623';
    ellipse(ctx, 470, 300, 22, 13, '#f5a623');
    circle(ctx, 488, 286, 10, '#f5a623');
    ctx.beginPath();
    ctx.moveTo(482, 278); ctx.lineTo(484, 268); ctx.lineTo(489, 277);
    ctx.moveTo(492, 277); ctx.lineTo(495, 267); ctx.lineTo(498, 278);
    ctx.fill();
    ctx.strokeStyle = '#f5a623';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(450, 300);
    ctx.quadraticCurveTo(436, 292, 442, 280);
    ctx.stroke();
  }
  // price sign on the right stall
  rrect(ctx, 420, 356, 74, 52, 8, '#fff8ec');
  ctx.strokeStyle = '#22303c';
  ctx.lineWidth = 3;
  ctx.strokeRect(420, 356, 74, 52);
  ctx.fillStyle = '#22303c';
  ctx.font = '700 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(variant ? '8rb' : '5rb', 457, 383); // diff 7: price 5rb -> 8rb
}

// ---- Scene 2: Pelabuhan Senja (sunset harbour) ----------------------------
function drawPelabuhan(ctx, variant) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ff9a5c');
  sky.addColorStop(0.55, '#ff7e6b');
  sky.addColorStop(1, '#c86dd7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 300);
  // setting sun over the sea
  circle(ctx, 300, 218, 44, '#ffd23e');
  circle(ctx, 300, 218, 34, '#ffe98a');
  if (variant) cloud(ctx, 262, 196, 0.9, '#ffd9c2'); // diff 1: cloud drifts over the sun
  cloud(ctx, 90, 70, 1, '#ffd9c2');
  cloud(ctx, 470, 52, 0.8, '#ffd9c2');
  bird(ctx, 140, 90);
  bird(ctx, 178, 70, 0.8);
  if (!variant) bird(ctx, 420, 96, 0.9); // diff 2: third seagull
  // lighthouse (left)
  ctx.fillStyle = '#f4f1e8';
  ctx.beginPath();
  ctx.moveTo(58, 280); ctx.lineTo(72, 120); ctx.lineTo(104, 120); ctx.lineTo(118, 280);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e2543e';
  ctx.fillRect(64, 200, 48, 22);
  ctx.fillRect(68, 152, 40, 22);
  rrect(ctx, 62, 96, 52, 26, 4, '#22303c');
  circle(ctx, 88, 109, 9, variant ? '#3a3a3a' : '#ffe98a'); // diff 3: lamp on/off
  if (!variant) {
    const beam = ctx.createLinearGradient(114, 109, 260, 109);
    beam.addColorStop(0, 'rgba(255, 233, 138, 0.85)');
    beam.addColorStop(1, 'rgba(255, 233, 138, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(114, 100); ctx.lineTo(268, 78); ctx.lineTo(268, 140); ctx.lineTo(114, 118);
    ctx.closePath();
    ctx.fill();
  }
  // sea
  const sea = ctx.createLinearGradient(0, 280, 0, 470);
  sea.addColorStop(0, '#e8736b');
  sea.addColorStop(1, '#2a4d8f');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 280, SCENE_W, 190);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(150 + i * 70, 306 + i * 26);
    ctx.quadraticCurveTo(180 + i * 70, 300 + i * 26, 210 + i * 70, 306 + i * 26);
    ctx.stroke();
  }
  // sailboat (centre)
  ctx.fillStyle = '#5b3a1e';
  ctx.beginPath();
  ctx.moveTo(238, 330); ctx.lineTo(352, 330); ctx.lineTo(330, 352); ctx.lineTo(260, 352);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(292, 210, 5, 122);
  ctx.fillStyle = variant ? '#e2543e' : '#fff8ec'; // diff 4: white sail -> red sail
  ctx.beginPath();
  ctx.moveTo(297, 214); ctx.lineTo(297, 322); ctx.lineTo(348, 322);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f5b301';
  ctx.beginPath();
  ctx.moveTo(292, 214); ctx.lineTo(292, 322); ctx.lineTo(252, 322);
  ctx.closePath();
  ctx.fill();
  // small rowboat (right)
  ctx.fillStyle = '#2f9e5f';
  ctx.beginPath();
  ctx.moveTo(430, 372); ctx.lineTo(520, 372); ctx.lineTo(500, 390); ctx.lineTo(450, 390);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2c89b';
  circle(ctx, 468, 356, 11, '#f2c89b');
  rrect(ctx, 456, 364, 24, 10, 4, '#3a7bd5');
  // jumping fish
  if (!variant) {
    ctx.fillStyle = '#7fd4ff';
    ctx.beginPath();
    ctx.ellipse(392, 318, 16, 7, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(406, 312); ctx.lineTo(416, 306); ctx.lineTo(414, 320);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(392, 334, 10, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } // diff 5: fish jumps out of the water
  // wooden dock (bottom)
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(0, 400, SCENE_W, 70);
  ctx.fillStyle = '#6e4520';
  for (let x = 0; x < SCENE_W; x += 72) ctx.fillRect(x, 400, 4, 70);
  ctx.fillStyle = '#a4713f';
  ctx.fillRect(0, 400, SCENE_W, 8);
  // crates on the dock
  ctx.fillStyle = '#c98f3d';
  ctx.fillRect(486, 372, 34, 28);
  ctx.fillRect(522, 372, 34, 28);
  if (!variant) ctx.fillRect(504, 344, 34, 28); // diff 6: third crate on top
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 2;
  ctx.strokeRect(486, 372, 34, 28);
  ctx.strokeRect(522, 372, 34, 28);
  if (!variant) ctx.strokeRect(504, 344, 34, 28);
  // anchor leaning on the dock
  if (!variant) {
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(150, 420); ctx.lineTo(150, 456);
    ctx.moveTo(132, 428); ctx.lineTo(168, 428);
    ctx.beginPath();
    ctx.arc(150, 452, 12, 0, Math.PI);
    ctx.stroke();
    circle(ctx, 150, 414, 5, '#22303c');
  } // diff 7: anchor by the dock
}

// ---- Scene 3: Taman Kota (city park) ---------------------------------------
function drawTaman(ctx, variant) {
  const sky = ctx.createLinearGradient(0, 0, 0, 280);
  sky.addColorStop(0, '#7ec8f2');
  sky.addColorStop(1, '#d8f3e3');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_W, 280);
  sun(ctx, 500, 62, 28, true);
  cloud(ctx, 120, 66, 1);
  cloud(ctx, 320, 44, 0.75);
  // kite in the sky
  if (!variant) {
    ctx.fillStyle = '#e2543e';
    ctx.beginPath();
    ctx.moveTo(452, 96); ctx.lineTo(486, 118); ctx.lineTo(452, 142); ctx.lineTo(420, 118);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#22303c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(452, 142);
    ctx.quadraticCurveTo(430, 190, 452, 226);
    ctx.stroke();
    ctx.fillStyle = '#f5b301';
    ctx.beginPath();
    ctx.moveTo(452, 142); ctx.lineTo(462, 150); ctx.lineTo(452, 158); ctx.lineTo(442, 150);
    ctx.closePath();
    ctx.fill();
  } // diff 1: red kite
  // distant city skyline
  ctx.fillStyle = '#9fb8c8';
  ctx.fillRect(0, 216, 60, 64);
  ctx.fillRect(70, 196, 46, 84);
  ctx.fillRect(470, 206, 56, 74);
  ctx.fillRect(536, 222, 44, 58);
  ctx.fillStyle = '#7ec8f2';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(78 + i * 10, 206, 6, 8);
  // lawn
  ctx.fillStyle = '#79c94f';
  ctx.fillRect(0, 280, SCENE_W, 190);
  ctx.fillStyle = '#6ab844';
  ctx.fillRect(0, 280, SCENE_W, 10);
  // path
  ctx.fillStyle = '#e8d5a8';
  ctx.beginPath();
  ctx.moveTo(250, 470); ctx.lineTo(300, 470); ctx.lineTo(330, 280); ctx.lineTo(300, 280);
  ctx.closePath();
  ctx.fill();
  // big tree (left)
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(96, 210, 22, 110);
  circle(ctx, 107, 178, 62, '#2f9e5f');
  circle(ctx, 62, 200, 40, '#3aa564');
  circle(ctx, 152, 202, 42, '#3aa564');
  if (!variant) {
    circle(ctx, 76, 168, 8, '#e2543e'); // diff 2: apples on the tree
    circle(ctx, 128, 150, 8, '#e2543e');
    circle(ctx, 150, 196, 8, '#e2543e');
    circle(ctx, 92, 206, 8, '#e2543e');
  }
  // pond (left-centre)
  ellipse(ctx, 205, 348, 96, 40, '#4aa8dd');
  ellipse(ctx, 205, 344, 84, 32, '#7cc7ee');
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(185, 344, 26, 8, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (!variant) {
    // diff 3: duck on the pond
    ellipse(ctx, 232, 342, 16, 11, '#ffffff');
    circle(ctx, 246, 330, 9, '#ffffff');
    ctx.fillStyle = '#f5b301';
    ctx.beginPath();
    ctx.moveTo(254, 329); ctx.lineTo(262, 332); ctx.lineTo(254, 335);
    ctx.closePath();
    ctx.fill();
    circle(ctx, 248, 328, 1.6, '#22303c');
  }
  // bench (right)
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(352, 300, 110, 10);
  ctx.fillRect(352, 318, 110, 10);
  ctx.fillRect(360, 328, 8, 34);
  ctx.fillRect(446, 328, 8, 34);
  ctx.fillStyle = '#6e4520';
  ctx.fillRect(352, 282, 8, 48);
  ctx.fillRect(454, 282, 8, 48);
  if (!variant) {
    // diff 4: bag on the bench
    rrect(ctx, 392, 268, 44, 32, 8, '#e2543e');
    ctx.strokeStyle = '#8a2f22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(414, 268, 12, Math.PI, 0);
    ctx.stroke();
  }
  // fountain (right)
  ellipse(ctx, 512, 392, 52, 16, '#b9c4c9');
  ellipse(ctx, 512, 388, 44, 12, '#4aa8dd');
  ctx.fillStyle = '#8fa3ab';
  ctx.fillRect(506, 330, 12, 58);
  circle(ctx, 512, 326, 16, '#b9c4c9');
  const jets = variant ? 1 : 3; // diff 5: fountain jets high -> low
  ctx.strokeStyle = '#7cc7ee';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < jets; i += 1) {
    const dx = (i - 1) * 14;
    ctx.beginPath();
    ctx.moveTo(512 + dx, 322);
    ctx.quadraticCurveTo(512 + dx * 1.6, 296 - (jets === 3 ? 10 : 0), 512 + dx * 2.2, 330);
    ctx.stroke();
  }
  // flower beds
  const petal = variant ? '#8e44ad' : '#e2543e'; // diff 6: red flowers -> purple
  for (let i = 0; i < 6; i += 1) {
    const x = 300 + i * 26;
    ctx.strokeStyle = '#2f9e5f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 432); ctx.lineTo(x, 410);
    ctx.stroke();
    circle(ctx, x, 404, 8, petal);
    circle(ctx, x, 404, 3.5, '#f5b301');
  }
  for (let i = 0; i < 4; i += 1) {
    const x = 60 + i * 26;
    ctx.strokeStyle = '#2f9e5f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 448); ctx.lineTo(x, 428);
    ctx.stroke();
    circle(ctx, x, 422, 7, '#f5b301');
    circle(ctx, x, 422, 3, '#e2543e');
  }
  // butterfly
  if (!variant) {
    ctx.fillStyle = '#f5b301'; // diff 7: butterfly over the flowers
    ctx.beginPath();
    ctx.ellipse(252, 176, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.ellipse(252, 190, 9, 6, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2543e';
    ctx.beginPath();
    ctx.ellipse(266, 176, 9, 6, 0.5, 0, Math.PI * 2);
    ctx.ellipse(266, 190, 9, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---- scene registry --------------------------------------------------------
export const SCENES = {
  pasar: { draw: drawPasar },
  pelabuhan: { draw: drawPelabuhan },
  taman: { draw: drawTaman },
};

export function drawScene(ctx, levelId, variant) {
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  SCENES[levelId].draw(ctx, variant);
}

// ---- differences: click targets in scene coordinates -----------------------
export const DIFFS = {
  pasar: [
    { id: 'sun-rays', x: 88, y: 66, r: 42, label: 'Sinar matahari' },
    { id: 'bird', x: 210, y: 58, r: 26, label: 'Burung di langit' },
    { id: 'awning', x: 150, y: 176, r: 40, label: 'Warna tenda kiri' },
    { id: 'oranges', x: 128, y: 292, r: 42, label: 'Buah jeruk' },
    { id: 'hat', x: 300, y: 216, r: 34, label: 'Topi penjual' },
    { id: 'cat', x: 470, y: 292, r: 34, label: 'Kucing di lapak' },
    { id: 'price', x: 457, y: 382, r: 36, label: 'Harga di papan' },
  ],
  pelabuhan: [
    { id: 'cloud-sun', x: 300, y: 204, r: 44, label: 'Awan menutupi matahari' },
    { id: 'gull', x: 420, y: 96, r: 26, label: 'Burung camar ketiga' },
    { id: 'lamp', x: 88, y: 109, r: 34, label: 'Lampu mercusuar' },
    { id: 'sail', x: 312, y: 268, r: 44, label: 'Warna layar kapal' },
    { id: 'fish', x: 396, y: 318, r: 30, label: 'Ikan melompat' },
    { id: 'crate', x: 521, y: 358, r: 32, label: 'Peti di atas tumpukan' },
    { id: 'anchor', x: 150, y: 436, r: 32, label: 'Jangkar di dermaga' },
  ],
  taman: [
    { id: 'kite', x: 452, y: 118, r: 40, label: 'Layang-layang' },
    { id: 'apples', x: 112, y: 178, r: 44, label: 'Apel di pohon' },
    { id: 'duck', x: 236, y: 338, r: 32, label: 'Bebek di kolam' },
    { id: 'bag', x: 414, y: 284, r: 34, label: 'Tas di bangku' },
    { id: 'jets', x: 512, y: 318, r: 36, label: 'Air mancur' },
    { id: 'flowers', x: 378, y: 408, r: 40, label: 'Warna bunga' },
    { id: 'butterfly', x: 259, y: 182, r: 28, label: 'Kupu-kupu' },
  ],
};

// ---- level state -----------------------------------------------------------
export function createLevel(levelIndex) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    level,
    diffs: DIFFS[level.id],
    found: new Set(),
    foundOrder: [],
    hintsLeft: GAME.hintsPerLevel,
    score: 0,
    startedAt: 0,
    elapsedMs: 0,
    finished: false,
    finishMs: 0,
    hint: null, // { diffId, untilMs }
    wrongAt: 0,
    wrongPos: null,
    popAt: 0,
    popDiff: null,
  };
}

/** Try to mark a difference at scene coords (x, y). Returns 'found' | 'wrong' | 'done'. */
export function tryMark(state, x, y, nowMs) {
  if (state.finished) return 'done';
  let best = null;
  let bestD = Infinity;
  for (const d of state.diffs) {
    if (state.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= d.r + 14 && dist < bestD) {
      best = d;
      bestD = dist;
    }
  }
  if (best) {
    state.found.add(best.id);
    state.foundOrder.push(best.id);
    state.score += GAME.pointsFound;
    state.popAt = nowMs;
    state.popDiff = best.id;
    if (state.found.size >= GAME.diffsPerLevel) {
      state.finished = true;
      state.finishMs = state.elapsedMs;
      const bonus = Math.max(0, GAME.parTimeSeconds - Math.floor(state.elapsedMs / 1000)) * GAME.timeBonusPerSecond;
      state.score += bonus;
      state.timeBonus = bonus;
    }
    return 'found';
  }
  state.score = Math.max(0, state.score + GAME.pointsWrong);
  state.wrongAt = nowMs;
  state.wrongPos = { x, y };
  return 'wrong';
}

/** Spend a hint: returns the diff id to highlight, or null when none left. */
export function useHint(state, nowMs) {
  if (state.finished || state.hintsLeft <= 0) return null;
  const remaining = state.diffs.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score + GAME.pointsHint);
  state.hint = { diffId: diff.id, untilMs: nowMs + GAME.hintPulseMs };
  return diff;
}

export function remainingCount(state) {
  return GAME.diffsPerLevel - state.found.size;
}

export function starsFor(state) {
  if (!state.finished) return 0;
  const seconds = Math.floor(state.finishMs / 1000);
  if (seconds <= 60 && state.hintsLeft === GAME.hintsPerLevel) return 3;
  if (seconds <= 120) return 2;
  return 1;
}
