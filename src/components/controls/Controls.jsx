import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "../../assets/Logo.png";
import "./Controls.css";

const Controls = ({
  running,
  setRunning,
  stop,
  uavs,
  refreshData,
  handleLocationSearch,
  handleStart,
  loading,
  uavCount,
  setUavCount,
}) => {
  const [location, setLocation] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (running) setSessions((prev) => prev + 1);
  }, [running]);

  const handleSearch = () => {
    if (handleLocationSearch && location.trim() !== "") {
      handleLocationSearch(location.trim());
      setLocation("");
    }
  };

  const handleUavCountChange = (event) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value)) {
      setUavCount(1);
      return;
    }

    if (value > 100) {
      toast.error("Maximum 100 drones allowed");
      setUavCount(100);
      return;
    }

    if (value < 1) {
      setUavCount(1);
      return;
    }

    setUavCount(value);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="controls-panel">
      <div className="controls-stack">
        <div className="d-flex justify-content-center">
          <img src={logo} alt="Logo" className="controls-logo-main" />
        </div>

        <div className="d-flex justify-content-center align-items-center mt-3" style={{ gap: 10 }}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter state or city"
            className="controls-input"
          />
          <button
            className="btn btn-primary rounded-pill controls-btn go px-4 py-2"
            onClick={handleSearch}
          >
            Go
          </button>
        </div>

        <div className="mt-3 d-flex justify-content-center">
          <label className="text-white me-2 mt-2">UAVs</label>
          <input
            type="number"
            min={1}
            max={100}
            value={uavCount}
            onChange={handleUavCountChange}
            className="controls-input"
            style={{ width: 110 }}
          />
        </div>

        <div className="upperbox">
          <div className="d-flex justify-content-center mt-3 pb-2 controls-actions">
            <button
              className="str-btn rounded-pill"
              onClick={() => {
                if (running) {
                  setRunning(false);
                  return;
                }
                handleStart();
              }}
              disabled={loading}
            >
              {loading ? "Simulating..." : running ? "Pause" : "Start"}
            </button>
            <button
              className="end-btn rounded-pill"
              onClick={() => {
                stop();
                setElapsedTime(0);
              }}
            >
              Stop
            </button>
          </div>
        </div>
      </div>

      <button className="refresh mt-2" onClick={refreshData} disabled={loading}>
        {loading ? "Working..." : "Regenerate Simulation"}
      </button>

      <div
        className="text-white opacity-75"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: 300,
          marginTop: 10,
        }}
      >
        <div>
          <strong>UAVs:</strong> {uavs.length}
        </div>
        <div>
          <strong>Sessions:</strong> {sessions}
        </div>
      </div>

      <div className="text-white timebox opacity-75">Time Elapsed: {formatTime(elapsedTime)}</div>
    </div>
  );
};

export default Controls;
