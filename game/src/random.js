// random.js — a tiny seeded RNG (mulberry32) plus small helpers.
// The game itself is fully deterministic per level, but the helpers are used
// for cosmetic jitter (cloud drift, wave phase) so scenes feel alive.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function range(rng, min, max) {
  return min + rng() * (max - min);
}

export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

/** Deterministic jitter in [-amount, amount] from a seed + index. */
export function jitter(seed, index, amount) {
  const rng = mulberry32(seed * 7919 + index * 104729);
  return (rng() * 2 - 1) * amount;
}
