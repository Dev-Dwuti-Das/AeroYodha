import { astar, bfs, dijkstra, nodeKey } from "./astar.js";
import { createRng, generateNoFlyZones, pickUniqueNodes } from "./nofly.js";

function cloneNode([x, y]) {
  return [x, y];
}

function computePath(start, goal, config) {
  const { rows, cols, blocked, algorithm } = config;
  if (algorithm === "bfs") return bfs(start, goal, rows, cols, blocked);
  if (algorithm === "dijkstra") return dijkstra(start, goal, rows, cols, blocked);
  return astar(start, goal, rows, cols, blocked);
}

function makeSnapshot(step, uavs, noFlyZones) {
  return {
    step,
    uavs: uavs.map((u) => ({
      id: u.id,
      x: u.x,
      y: u.y,
      start: cloneNode(u.start),
      goal: cloneNode(u.goal),
      reached: u.reached,
      path: u.path.map(cloneNode),
    })),
    noFlyZones: noFlyZones.map(cloneNode),
  };
}

function buildDynamicBlocked(uavs, currentId, noFlySet) {
  const blocked = new Set(noFlySet);
  for (const u of uavs) {
    if (u.id === currentId || u.reached) continue;
    blocked.add(`${u.x},${u.y}`);
  }
  return blocked;
}

export function runSimulation(options = {}) {
  const rows = options.rows ?? 80;
  const cols = options.cols ?? 80;
  const numUavs = options.numUavs ?? 7;
  const maxSteps = options.maxSteps ?? 80;
  const noFlyRatio = options.noFlyRatio ?? 0.02;
  const waitThreshold = options.waitThreshold ?? 3;
  const algorithm = options.algorithm ?? "astar";
  const seed = options.seed ?? Date.now();

  const rng = createRng(seed);
  const noFly = generateNoFlyZones(rows, cols, noFlyRatio, rng);

  const startAndGoalPool = pickUniqueNodes(numUavs * 2, rows, cols, rng, noFly.set);
  const starts = startAndGoalPool.slice(0, numUavs);
  const goals = startAndGoalPool.slice(numUavs, numUavs * 2);

  const uavs = starts.map((start, index) => ({
    id: index,
    x: start[0],
    y: start[1],
    start,
    goal: goals[index],
    reached: false,
    waitCount: 0,
    path: [],
  }));

  for (const u of uavs) {
    const blocked = buildDynamicBlocked(uavs, u.id, noFly.set);
    const path = computePath([u.x, u.y], u.goal, { rows, cols, blocked, algorithm });
    u.path = path ?? [[u.x, u.y]];
  }

  const steps = [makeSnapshot(0, uavs, noFly.list)];

  for (let step = 1; step <= maxSteps; step += 1) {
    const desiredById = new Map();

    for (const u of uavs) {
      if (u.reached) {
        desiredById.set(u.id, null);
        continue;
      }

      if (u.x === u.goal[0] && u.y === u.goal[1]) {
        u.reached = true;
        desiredById.set(u.id, null);
        continue;
      }

      const pathInvalid = u.path.length < 2 || u.path[0][0] !== u.x || u.path[0][1] !== u.y;
      if (pathInvalid) {
        const blocked = buildDynamicBlocked(uavs, u.id, noFly.set);
        const freshPath = computePath([u.x, u.y], u.goal, { rows, cols, blocked, algorithm });
        u.path = freshPath ?? [[u.x, u.y]];
      }

      desiredById.set(u.id, u.path.length > 1 ? u.path[1] : null);
    }

    const currentOccupancy = new Map();
    for (const u of uavs) {
      if (!u.reached) currentOccupancy.set(`${u.x},${u.y}`, u.id);
    }

    const contenders = new Map();
    for (const [uid, node] of desiredById.entries()) {
      if (!node) continue;
      const key = nodeKey(node);
      if (!contenders.has(key)) contenders.set(key, []);
      contenders.get(key).push(uid);
    }

    const allowed = new Set();
    for (const [key, ids] of contenders.entries()) {
      if (ids.length === 1) {
        allowed.add(ids[0]);
        continue;
      }

      ids.sort((a, b) => a - b);
      const winner = ids[0];
      allowed.add(winner);
      const occupiedBy = currentOccupancy.get(key);
      if (occupiedBy !== undefined && occupiedBy !== winner) {
        allowed.delete(winner);
      }
    }

    for (const u of uavs) {
      const desired = desiredById.get(u.id);
      if (!desired || !allowed.has(u.id)) {
        u.waitCount += 1;
        continue;
      }

      const desiredKey = nodeKey(desired);
      const occupantId = currentOccupancy.get(desiredKey);
      if (occupantId !== undefined && occupantId !== u.id) {
        const occDesired = desiredById.get(occupantId);
        if (!occDesired || nodeKey(occDesired) !== `${u.x},${u.y}`) {
          u.waitCount += 1;
          continue;
        }
      }

      u.x = desired[0];
      u.y = desired[1];
      u.path = u.path.length > 1 ? u.path.slice(1) : [[u.x, u.y]];
      u.waitCount = 0;

      if (u.x === u.goal[0] && u.y === u.goal[1]) {
        u.reached = true;
      }
    }

    for (const u of uavs) {
      if (u.reached || u.waitCount < waitThreshold) continue;
      const blocked = buildDynamicBlocked(uavs, u.id, noFly.set);
      const replanned = computePath([u.x, u.y], u.goal, { rows, cols, blocked, algorithm });
      if (replanned) {
        u.path = replanned;
        u.waitCount = 0;
      }
    }

    steps.push(makeSnapshot(step, uavs, noFly.list));

    if (uavs.every((u) => u.reached)) {
      break;
    }
  }

  return { steps, meta: { rows, cols, numUavs, seed, algorithm } };
}
