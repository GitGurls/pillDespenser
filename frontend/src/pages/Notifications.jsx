import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const LOW_STOCK_THRESHOLD = 5;

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNotifications(); }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const [medicines, schedules, device] = await Promise.all([
        apiRequest("/medicines"),
        apiRequest("/schedules"),
        apiRequest("/device/status"),
      ]);

      const items = [];

      // Device offline alert
      if (device?.status !== "online") {
        items.push({
          id: "device-offline",
          severity: "alert",
          icon: "⚠️",
          title: "Device is offline",
          sub: device?.lastSeen
            ? `Last seen ${new Date(device.lastSeen).toLocaleString()}`
            : "This device has never connected yet.",
        });
      }

      // Low medicine alerts
      medicines
        .filter((m) => m.quantity <= LOW_STOCK_THRESHOLD)
        .forEach((m) => {
          items.push({
            id: `low-${m.id}`,
            severity: "warning",
            icon: "💊",
            title: `${m.medicineName} is running low`,
            sub: `Only ${m.quantity} left — consider refilling soon.`,
          });
        });

      // Today's dose reminders
      const today = new Date();
      const todayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()];
      schedules
        .filter((s) => !s.repeatDays?.length || s.repeatDays.includes(todayShort))
        .forEach((s) => {
          const med = medicines.find((m) => m.id === s.medicineId);
          items.push({
            id: `reminder-${s.id}`,
            severity: "info",
            icon: "⏰",
            title: `${med ? med.medicineName : "Medicine"} scheduled today`,
            sub: `Dose time: ${s.time}`,
          });
        });

      setNotifications(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Notifications</h1>
          <p>Reminders, low-stock alerts, and device warnings.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : notifications.length === 0 ? (
          <p className="empty-state">You're all caught up — nothing needs attention right now.</p>
        ) : (
          notifications.map((n) => (
            <div className={`notif-item severity-${n.severity}`} key={n.id}>
              <div className="notif-icon">{n.icon}</div>
              <div className="notif-body">
                <div className="notif-title">{n.title}</div>
                <div className="notif-sub">{n.sub}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
