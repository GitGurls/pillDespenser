import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const emptyForm = { medicineId: "", time: "", repeatDays: [] };

export default function Schedule() {
  const [medicines, setMedicines] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [meds, scheds] = await Promise.all([
        apiRequest("/medicines"),
        apiRequest("/schedules"),
      ]);
      setMedicines(meds);
      setSchedules(scheds);
      if (!editingId && meds.length && !form.medicineId) {
        setForm((f) => ({ ...f, medicineId: meds[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleDay(day) {
    setForm((f) => ({
      ...f,
      repeatDays: f.repeatDays.includes(day)
        ? f.repeatDays.filter((d) => d !== day)
        : [...f.repeatDays, day],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.medicineId) return alert("Please add a medicine first.");
    setSaving(true);
    try {
      if (editingId) {
        await apiRequest(`/schedules/${editingId}`, { method: "PUT", body: form });
      } else {
        await apiRequest("/schedules", { method: "POST", body: form });
      }
      exitEditMode();
      loadAll();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function enterEditMode(s) {
    setEditingId(s.id);
    setForm({ medicineId: s.medicineId, time: s.time, repeatDays: s.repeatDays || [] });
  }

  function exitEditMode() {
    setEditingId(null);
    setForm({ ...emptyForm, medicineId: medicines[0]?.id || "" });
  }

  async function handleDelete(id) {
    if (!confirm("Delete this schedule?")) return;
    await apiRequest(`/schedules/${id}`, { method: "DELETE" });
    if (editingId === id) exitEditMode();
    loadAll();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Schedule</h1>
          <p>Set when each medicine should be dispensed.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2>{editingId ? "Edit Schedule" : "Add Schedule"}</h2>
        {medicines.length === 0 && !loading ? (
          <p className="empty-state">Add a medicine first from the Medicines page.</p>
        ) : (
          <form className="inline-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="medicineId">Medicine</label>
              <select
                id="medicineId"
                required
                value={form.medicineId}
                onChange={(e) => setForm({ ...form, medicineId: e.target.value })}
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>{m.medicineName} ({m.dosage})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="field" style={{ flexBasis: "100%" }}>
              <label>Repeat Days</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAYS.map((d) => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 400 }}>
                    <input
                      type="checkbox"
                      style={{ width: "auto" }}
                      checked={form.repeatDays.includes(d)}
                      onChange={() => toggleDay(d)}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {editingId ? "Update" : "Add Schedule"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={exitEditMode}>
                Cancel
              </button>
            )}
          </form>
        )}
      </div>

      <div className="card">
        <h2>Your Schedules</h2>
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : schedules.length === 0 ? (
          <p className="empty-state">No schedules yet.</p>
        ) : (
          schedules.map((s) => {
            const med = medicines.find((m) => m.id === s.medicineId);
            return (
              <div className="list-row" key={s.id}>
                <div>
                  <div className="name">{med ? med.medicineName : "Unknown medicine"}</div>
                  <div className="meta">{s.repeatDays?.length ? s.repeatDays.join(", ") : "One-time"}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="data-mono">{s.time}</span>
                  <div className="row-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => enterEditMode(s)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
