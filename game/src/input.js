// input.js — pointer + keyboard input, translated into game actions.
// The canvas is scaled to fit the window, so pointer coordinates are mapped
// back into logical (1280x800) space. The keyboard drives a crosshair
// cursor: arrow keys move it, Enter/Space marks the spot under it.

import { PANEL, VIEW } from './config.js';
import { layoutButtons } from './render.js';

export function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
}

/** Which panel (if any) a logical point is inside, and its scene coords. */
export function panelAt(x, y) {
  const innerY = PANEL.y + 34;
  if (y < innerY || y > innerY + 470) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { side: 'left', sx: x - PANEL.leftX, sy: y - innerY };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { side: 'right', sx: x - PANEL.rightX, sy: y - innerY };
  }
  return null;
}

function buttonAt(app, x, y) {
  for (const b of layoutButtons(app)) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

/**
 * Wire up input. `handlers` is { onMark(sx, sy, px, py), onButton(id),
 * onKey(action) } where action is 'up'|'down'|'left'|'right'|'mark'|'hint'.
 */
export function attachInput(canvas, app, handlers) {
  canvas.addEventListener('pointerdown', (event) => {
    const p = toLogical(canvas, event.clientX, event.clientY);
    app.cursor.x = p.x;
    app.cursor.y = p.y;
    app.cursor.visible = true;
    const btn = buttonAt(app, p.x, p.y);
    if (btn) {
      handlers.onButton(btn);
      return;
    }
    if (app.screen === 'select' && app.showHowto) {
      app.showHowto = false;
      return;
    }
    if (app.screen === 'play') {
      const panel = panelAt(p.x, p.y);
      if (panel) handlers.onMark(panel.sx, panel.sy, p.x, p.y);
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (app.screen !== 'play') {
      if ((key === 'Enter' || key === ' ') && app.screen === 'select' && app.showHowto) {
        app.showHowto = false;
      }
      return;
    }
    const step = event.shiftKey ? 60 : 22;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight') {
      event.preventDefault();
      app.cursor.visible = true;
      if (key === 'ArrowUp') app.cursor.y = Math.max(PANEL.y + 40, app.cursor.y - step);
      if (key === 'ArrowDown') app.cursor.y = Math.min(PANEL.y + PANEL.height - 6, app.cursor.y + step);
      if (key === 'ArrowLeft') app.cursor.x = Math.max(PANEL.leftX + 6, app.cursor.x - step);
      if (key === 'ArrowRight') app.cursor.x = Math.min(PANEL.rightX + PANEL.width - 6, app.cursor.x + step);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const panel = panelAt(app.cursor.x, app.cursor.y);
      if (panel) handlers.onMark(panel.sx, panel.sy, app.cursor.x, app.cursor.y);
    } else if (key === 'h' || key === 'H') {
      handlers.onButton('hint');
    } else if (key === 'm' || key === 'M') {
      handlers.onButton('sound');
    }
  });
}
