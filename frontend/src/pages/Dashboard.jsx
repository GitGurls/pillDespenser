import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [missed, setMissed] = useState(0);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [meds, scheds, daily, dev] = await Promise.all([
          apiRequest("/medicines"),
          apiRequest("/schedules"),
          apiRequest("/reports/daily"),
          apiRequest("/device/status"),
        ]);
        if (cancelled) return;
        setMedicines(meds);
        setSchedules(scheds);
        setMissed(daily.missed);
        setDevice(dev);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const firstName = user?.email?.split("@")[0];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Welcome{firstName ? `, ${firstName}` : ""}</h1>
          <p>Today's overview at a glance.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Total Medicines</div>
          <div className="stat-value">{loading ? "–" : medicines.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Today's Doses</div>
          <div className="stat-value">{loading ? "–" : schedules.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Missed Doses</div>
          <div className="stat-value">{loading ? "–" : missed}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Device Status</div>
          <div className="stat-value">
            {loading ? (
              "–"
            ) : device?.status === "online" ? (
              <span className="pill-tag online"><span className="dot"></span>Online</span>
            ) : (
              <span className="pill-tag offline"><span className="dot"></span>Offline</span>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Upcoming Doses</h2>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : schedules.length === 0 ? (
          <p className="empty-state">No schedules yet. Add one from the Schedule page.</p>
        ) : (
          schedules.map((s) => {
            const med = medicines.find((m) => m.id === s.medicineId);
            return (
              <div className="list-row" key={s.id}>
                <div>
                  <div className="name">{med ? med.medicineName : "Unknown medicine"}</div>
                  <div className="meta">{s.repeatDays?.length ? s.repeatDays.join(", ") : "One-time"}</div>
                </div>
                <div className="data-mono">{s.time}</div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
