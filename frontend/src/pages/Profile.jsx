import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const [reminderAlerts, setReminderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [deviceAlerts, setDeviceAlerts] = useState(true);

  const initial = user?.email ? user.email[0].toUpperCase() : "?";
  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "–";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Profile</h1>
          <p>Your account and notification preferences.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="profile-header">
          <div className="profile-avatar">{initial}</div>
          <div>
            <h2 style={{ margin: 0 }}>{user?.email}</h2>
            <p style={{ margin: 0 }}>Member since {joined}</p>
          </div>
        </div>
        <button className="btn btn-danger" onClick={logout}>Log out</button>
      </div>

      <div className="card">
        <h2>Notification Preferences</h2>
        <p style={{ marginBottom: 4 }}>
          UI placeholder for now — toggles aren't wired to filter the Notifications page yet, and reset on reload. Say the word if you want these persisted and connected.
        </p>

        <div className="settings-row">
          <div>
            <div className="settings-label">Dose reminders</div>
            <div className="settings-desc">Show today's scheduled doses on the Notifications page.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={reminderAlerts} onChange={(e) => setReminderAlerts(e.target.checked)} />
            <span className="toggle-track"></span>
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Low medicine alerts</div>
            <div className="settings-desc">Warn when a medicine's quantity is running low.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={lowStockAlerts} onChange={(e) => setLowStockAlerts(e.target.checked)} />
            <span className="toggle-track"></span>
          </label>
        </div>

        <div className="settings-row">
          <div>
            <div className="settings-label">Device offline alerts</div>
            <div className="settings-desc">Warn when the dispenser hasn't synced recently.</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={deviceAlerts} onChange={(e) => setDeviceAlerts(e.target.checked)} />
            <span className="toggle-track"></span>
          </label>
        </div>
      </div>
    </>
  );
}
