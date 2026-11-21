// shots.js — deterministic screenshot states behind ?shot=start|play|end|play2.
// Unlike a live player, a screenshot state is built by playing the real
// rules forward: startLevel() creates a real level and tryMark() marks real
// differences, so the frame is exactly what a player would see at that
// moment. The same query always gives the same frame.

import { tryMark } from './world.js';

function markDiffs(app, count, elapsedMs, nowMs) {
  const lv = app.level;
  lv.elapsedMs = elapsedMs;
  lv.startedAt = nowMs - elapsedMs;
  for (let i = 0; i < count; i += 1) {
    const d = lv.diffs[i];
    tryMark(lv, d.x, d.y, nowMs);
  }
  lv.elapsedMs = elapsedMs;
}

/** Put `app` into the named screenshot scene; returns the screen to show. */
export function stageShot(app, name, nowMs) {
  if (name === 'play') {
    app.startLevel(0);
    markDiffs(app, 3, 45200, nowMs);
    return 'play';
  }
  if (name === 'end') {
    app.startLevel(0);
    markDiffs(app, 7, 96000, nowMs);
    app.totalScore += app.level.score;
    app.screen = 'win';
    return 'win';
  }
  if (name === 'play2') {
    app.startLevel(1);
    markDiffs(app, 2, 38100, nowMs);
    return 'play';
  }
  // default: start / level select
  app.toMenu();
  return 'select';
}
