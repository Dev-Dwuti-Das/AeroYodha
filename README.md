# AeroYodha - Vercel Serverless UAV Simulation

AeroYodha is now a Vercel-compatible, one-click UAV simulation app.

## Architecture

- Frontend: React + Leaflet + react-leaflet-drift-marker
- API: Vercel Serverless Function (`/api/simulate`)
- Simulation: Pure JavaScript (A*, BFS, Dijkstra support)
- Storage: In-memory response payload per request (no MongoDB)

Runtime flow:

`User click -> /api/simulate -> full simulation generated -> steps returned -> frontend animates locally`

## Project Structure

```text
AeroYodha/
├── api/
│   └── simulate.js
├── lib/
│   ├── astar.js
│   ├── nofly.js
│   └── simulation.js
├── src/
│   ├── components/
│   │   ├── controls/
│   │   ├── map/
│   │   ├── splash/
│   │   └── UAVSimulation.jsx
│   ├── App.jsx
│   ├── main.jsx
│   ├── app.css
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## API

### `POST /api/simulate`

Optional request body:

```json
{
  "numUavs": 7,
  "maxSteps": 90,
  "algorithm": "astar",
  "noFlyRatio": 0.02,
  "seed": 123
}
```

Response:

```json
{
  "steps": [
    {
      "step": 0,
      "uavs": [
        {
          "id": 0,
          "x": 3,
          "y": 8,
          "start": [3, 8],
          "goal": [20, 24],
          "reached": false,
          "path": [[3, 8], [4, 8], [5, 8]]
        }
      ],
      "noFlyZones": [[7, 7], [7, 8]]
    }
  ],
  "meta": {
    "rows": 30,
    "cols": 30,
    "numUavs": 7,
    "seed": 123,
    "algorithm": "astar"
  }
}
```

## Local Run

```bash
npm install
npm run dev
```

## Vercel Deploy

1. Import this repo in Vercel.
2. Framework preset: `Vite`.
3. Deploy.

`/api/simulate` is deployed as a serverless function with `maxDuration: 5` seconds.
