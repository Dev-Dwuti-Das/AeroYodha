const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(value) {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }

  pop() {
    if (this.items.length === 0) return null;
    const top = this.items[0];
    const end = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = end;
      this.bubbleDown(0);
    }
    return top;
  }

  get size() {
    return this.items.length;
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.items[parentIndex].f <= this.items[index].f) break;
      [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
      index = parentIndex;
    }
  }

  bubbleDown(index) {
    const length = this.items.length;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;

      if (left < length && this.items[left].f < this.items[smallest].f) {
        smallest = left;
      }
      if (right < length && this.items[right].f < this.items[smallest].f) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

function keyOf(node) {
  return `${node[0]},${node[1]}`;
}

function parseKey(key) {
  const [x, y] = key.split(",").map(Number);
  return [x, y];
}

function manhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

export function neighbors([x, y], rows, cols) {
  const out = [];
  for (const [dx, dy] of DIRS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
      out.push([nx, ny]);
    }
  }
  return out;
}

export function astar(start, goal, rows, cols, blocked = new Set()) {
  const startKey = keyOf(start);
  const goalKey = keyOf(goal);
  if (startKey === goalKey) return [start];

  const open = new MinHeap();
  const gScore = new Map([[startKey, 0]]);
  const cameFrom = new Map();
  const openSeen = new Set([startKey]);

  open.push({ key: startKey, node: start, f: manhattan(start, goal) });

  while (open.size > 0) {
    const current = open.pop();
    if (!current) break;
    openSeen.delete(current.key);

    if (current.key === goalKey) {
      const path = [goalKey];
      let cursor = goalKey;
      while (cameFrom.has(cursor)) {
        cursor = cameFrom.get(cursor);
        path.push(cursor);
      }
      path.reverse();
      return path.map(parseKey);
    }

    const baseG = gScore.get(current.key) ?? Infinity;
    const nextNodes = neighbors(current.node, rows, cols);

    for (const next of nextNodes) {
      const nextKey = keyOf(next);
      if (blocked.has(nextKey) && nextKey !== goalKey) continue;

      const tentative = baseG + 1;
      if (tentative >= (gScore.get(nextKey) ?? Infinity)) continue;

      cameFrom.set(nextKey, current.key);
      gScore.set(nextKey, tentative);
      const f = tentative + manhattan(next, goal);

      if (!openSeen.has(nextKey)) {
        open.push({ key: nextKey, node: next, f });
        openSeen.add(nextKey);
      } else {
        open.push({ key: nextKey, node: next, f });
      }
    }
  }

  return null;
}

export function bfs(start, goal, rows, cols, blocked = new Set()) {
  const startKey = keyOf(start);
  const goalKey = keyOf(goal);
  if (startKey === goalKey) return [start];

  const queue = [start];
  const visited = new Set([startKey]);
  const prev = new Map();

  while (queue.length > 0) {
    const node = queue.shift();
    const nodeKey = keyOf(node);
    if (nodeKey === goalKey) break;

    for (const nxt of neighbors(node, rows, cols)) {
      const nxtKey = keyOf(nxt);
      if (visited.has(nxtKey)) continue;
      if (blocked.has(nxtKey) && nxtKey !== goalKey) continue;
      visited.add(nxtKey);
      prev.set(nxtKey, nodeKey);
      queue.push(nxt);
    }
  }

  if (!visited.has(goalKey)) return null;

  const path = [goalKey];
  let cursor = goalKey;
  while (prev.has(cursor)) {
    cursor = prev.get(cursor);
    path.push(cursor);
  }
  path.reverse();
  return path.map(parseKey);
}

export function dijkstra(start, goal, rows, cols, blocked = new Set()) {
  return astar(start, goal, rows, cols, blocked);
}

export function nodeKey(node) {
  return keyOf(node);
}
