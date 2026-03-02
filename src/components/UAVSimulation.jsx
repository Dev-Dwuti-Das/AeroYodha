import React, { useEffect, useMemo, useState } from "react";
import Controls from "./controls/Controls";
import BasicMap from "./map/UAVMap";

const STEP_INTERVAL_MS = 350;

export default function UAVSimulation() {
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uavs, setUavs] = useState([]);
  const [uavCount, setUavCount] = useState(7);
  const [noFlyZones, setNoFlyZones] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [city, setCity] = useState("");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  const currentSnapshot = steps[currentStepIndex] ?? null;

  const trails = useMemo(() => {
    const byId = {};
    for (let i = 0; i <= currentStepIndex && i < steps.length; i += 1) {
      const snapshot = steps[i];
      for (const uav of snapshot.uavs || []) {
        if (!byId[uav.id]) byId[uav.id] = [];
        byId[uav.id].push([uav.x, uav.y]);
      }
    }
    return byId;
  }, [steps, currentStepIndex]);

  useEffect(() => {
    if (!currentSnapshot) return;
    setUavs(currentSnapshot.uavs || []);
    setNoFlyZones(currentSnapshot.noFlyZones || []);
  }, [currentSnapshot]);

  useEffect(() => {
    if (!running || steps.length === 0) return undefined;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          setRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [running, steps]);

  const runSimulation = async (autoStart = true) => {
    setLoading(true);
    setRunning(false);

    try {
      const requestBody = {
        numUavs: uavCount,
        maxSteps: 90,
        algorithm: "astar",
        noFlyRatio: 0.02,
      };

      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      let payload;

      if (response.ok) {
        payload = await response.json();
      } else if (response.status === 404) {
        // Local Vite dev does not execute Vercel /api routes.
        const { runSimulation: runLocalSimulation } = await import("../../lib/simulation.js");
        payload = runLocalSimulation(requestBody);
      } else {
        throw new Error(`Simulation request failed: ${response.status}`);
      }

      const receivedSteps = payload.steps || [];
      setSteps(receivedSteps);
      setCurrentStepIndex(0);

      if (receivedSteps.length > 0) {
        setUavs(receivedSteps[0].uavs || []);
        setNoFlyZones(receivedSteps[0].noFlyZones || []);
      } else {
        setUavs([]);
        setNoFlyZones([]);
      }

      if (autoStart) {
        setRunning(true);
      }
    } catch (error) {
      console.error("Simulation error", error);
      setRunning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (loading) return;

    if (steps.length === 0 || currentStepIndex >= steps.length - 1) {
      await runSimulation(true);
      return;
    }

    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setCurrentStepIndex(0);
  };

  const refreshData = async () => {
    await runSimulation(false);
  };

  const handleLocationSearch = async (cityName) => {
    if (!cityName.trim()) return;
    setCity(cityName);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
      );
      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const newCenter = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newCenter);
      }
    } catch (error) {
      console.error("Error finding location", error);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ height: "100vh" }}>
      <div className="row g-0" style={{ height: "100%" }}>
        <div className="col-12 col-lg-9" style={{ height: "100%" }}>
          <BasicMap
            running={running}
            uavs={uavs}
            noFlyZones={noFlyZones}
            city={city}
            mapCenter={mapCenter}
            trails={trails}
          />
        </div>

        <div
          className="col-12 col-lg-3"
          style={{
            height: "100vh",
            overflowY: "auto",
            padding: "12px",
          }}
        >
          <Controls
            running={running}
            setRunning={setRunning}
            stop={stop}
            refreshData={refreshData}
            uavs={uavs}
            uavCount={uavCount}
            setUavCount={setUavCount}
            handleStart={handleStart}
            loading={loading}
            handleLocationSearch={handleLocationSearch}
          />
        </div>
      </div>
    </div>
  );
}
