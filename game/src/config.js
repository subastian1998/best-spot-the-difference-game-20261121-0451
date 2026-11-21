// config.js — constants for "Cari Bedanya!" (Spot the Difference).
// One logical canvas, scaled to fit the browser window. All sizes are in
// logical pixels; render.js scales the canvas to the window.

export const VIEW = { width: 1280, height: 800 };

export const PANEL = {
  width: 580,
  height: 504,
  y: 108,
  leftX: 30,
  rightX: 670,
};

export const HEADER = { height: 92 };

export const GAME = {
  diffsPerLevel: 7,
  hintsPerLevel: 3,
  pointsFound: 100,
  pointsWrong: -25,
  pointsHint: -50,
  timeBonusPerSecond: 5, // bonus at win: max(0, (parTime - seconds)) * this
  parTimeSeconds: 120,
  hintPulseMs: 2600,
  wrongFlashMs: 350,
  foundPopMs: 450,
};

export const LEVELS = [
  { id: 'pasar', name: 'Pasar Pagi', sub: 'Morning market', accent: '#e8632c' },
  { id: 'pelabuhan', name: 'Pelabuhan Senja', sub: 'Sunset harbour', accent: '#e2543e' },
  { id: 'taman', name: 'Taman Kota', sub: 'City park', accent: '#2f9e5f' },
];

export const UI = {
  fontTitle: '700 34px "Trebuchet MS", "Segoe UI", sans-serif',
  fontBig: '700 26px "Trebuchet MS", "Segoe UI", sans-serif',
  fontMed: '600 19px "Trebuchet MS", "Segoe UI", sans-serif',
  fontSmall: '600 15px "Trebuchet MS", "Segoe UI", sans-serif',
  fontTiny: '600 13px "Trebuchet MS", "Segoe UI", sans-serif',
  ink: '#22303c',
  inkSoft: '#5b6b78',
  paper: '#fff8ec',
  panelBorder: '#22303c',
  gold: '#f5b301',
  green: '#1f9d55',
  red: '#d92b2b',
};
