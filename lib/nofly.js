import { nodeKey } from "./astar.js";

export function createRng(seed = Date.now()) {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 1_000_000) / 1_000_000;
  };
}

export function pickUniqueNodes(count, rows, cols, rng, blocked = new Set()) {
  const out = [];
  const used = new Set(blocked);

  while (out.length < count) {
    const x = Math.floor(rng() * rows);
    const y = Math.floor(rng() * cols);
    const key = `${x},${y}`;
    if (used.has(key)) continue;
    used.add(key);
    out.push([x, y]);
  }

  return out;
}

export function generateNoFlyZones(rows, cols, ratio = 0.02, rng = Math.random) {
  const total = rows * cols;
  const count = Math.max(1, Math.floor(total * ratio));
  const nodes = pickUniqueNodes(count, rows, cols, rng);
  return {
    list: nodes,
    set: new Set(nodes.map(nodeKey)),
  };
}
