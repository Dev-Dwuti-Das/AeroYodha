import { runSimulation } from "../lib/simulation.js";

export default function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const params = req.method === "GET" ? req.query : req.body || {};

    const numUavs = Number(params.numUavs ?? 7);
    const maxSteps = Number(params.maxSteps ?? 80);
    const seed = Number(params.seed ?? Date.now());
    const noFlyRatio = Number(params.noFlyRatio ?? 0.02);
    const algorithm = String(params.algorithm ?? "astar").toLowerCase();

    const { steps, meta } = runSimulation({
      rows: 80,
      cols: 80,
      numUavs: Number.isFinite(numUavs) ? Math.max(1, Math.min(numUavs, 100)) : 7,
      maxSteps: Number.isFinite(maxSteps) ? Math.max(10, Math.min(maxSteps, 120)) : 80,
      seed: Number.isFinite(seed) ? seed : Date.now(),
      noFlyRatio: Number.isFinite(noFlyRatio) ? Math.max(0, Math.min(noFlyRatio, 0.1)) : 0.02,
      algorithm: ["astar", "bfs", "dijkstra"].includes(algorithm) ? algorithm : "astar",
    });

    return res.status(200).json({ steps, meta });
  } catch (error) {
    console.error("simulate error", error);
    return res.status(500).json({ error: "Simulation failed" });
  }
}
