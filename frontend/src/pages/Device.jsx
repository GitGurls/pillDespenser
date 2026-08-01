import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function Device() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicineName, setMedicineName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    setLoading(true);
    try {
      const data = await apiRequest("/device/status");
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    await apiRequest("/device/sync", { method: "POST" });
    loadStatus();
  }

  async function handleDispense(e) {
    e.preventDefault();
    setSending(true);
    try {
      await apiRequest("/device/dispense", { method: "POST", body: { medicineName, quantity: Number(quantity) || 1 } });
      setMessage("Dispense command sent to device.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Device</h1>
          <p>Live status of your ESP32 dispenser.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleSync}>Refresh Status</button>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value">
            {loading ? "–" : status?.status === "online" ? (
              <span className="pill-tag online"><span className="dot"></span>Online</span>
            ) : (
              <span className="pill-tag offline"><span className="dot"></span>Offline</span>
            )}
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Pill Count Remaining</div>
          <div className="stat-value">{loading ? "–" : status?.pillCount ?? "–"}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Last Sync</div>
          <div className="stat-value data-mono" style={{ fontSize: 15 }}>
            {loading ? "–" : status?.lastSeen ? new Date(status.lastSeen).toLocaleString() : "Never"}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Manual Control</h2>
        <p>Trigger the dispenser directly. This sends a command the device picks up on its next poll.</p>
        <form className="inline-form" onSubmit={handleDispense}>
          <div className="field">
            <label htmlFor="medicineName">Medicine</label>
            <input id="medicineName" required placeholder="e.g. Paracetamol" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? "Sending…" : "Dispense Now"}
          </button>
        </form>
        {message && <p className="success-msg">{message}</p>}
      </div>
    </>
  );
}
