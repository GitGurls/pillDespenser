import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const emptyForm = { medicineName: "", dosage: "", quantity: "" };

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadMedicines(); }, []);

  async function loadMedicines() {
    setLoading(true);
    try {
      const data = await apiRequest("/medicines");
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, quantity: Number(form.quantity) || 0 };
    try {
      if (editingId) {
        await apiRequest(`/medicines/${editingId}`, { method: "PUT", body: payload });
      } else {
        await apiRequest("/medicines", { method: "POST", body: payload });
      }
      exitEditMode();
      loadMedicines();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function enterEditMode(m) {
    setEditingId(m.id);
    setForm({ medicineName: m.medicineName, dosage: m.dosage, quantity: m.quantity });
  }

  function exitEditMode() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this medicine?")) return;
    await apiRequest(`/medicines/${id}`, { method: "DELETE" });
    if (editingId === id) exitEditMode();
    loadMedicines();
  }

  const filtered = medicines.filter((m) =>
    m.medicineName.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Medicines</h1>
          <p>Add and manage the medicines in your dispenser.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h2>{editingId ? "Edit Medicine" : "Add Medicine"}</h2>
        <form className="inline-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="medicineName">Name</label>
            <input
              id="medicineName"
              required
              placeholder="e.g. Paracetamol"
              value={form.medicineName}
              onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="dosage">Dosage</label>
            <input
              id="dosage"
              required
              placeholder="e.g. 500mg"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="0"
              placeholder="e.g. 30"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={exitEditMode}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ margin: 0 }}>Your Medicines</h2>
          <input
            style={{ width: 220 }}
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">{medicines.length === 0 ? "No medicines added yet." : "No medicines found."}</p>
        ) : (
          filtered.map((m) => (
            <div className="list-row" key={m.id}>
              <div>
                <div className="name">{m.medicineName}</div>
                <div className="meta">{m.dosage} · Qty: {m.quantity}
                  {m.quantity <= 5 && <span className="pill-tag warning" style={{ marginLeft: 8 }}>Low stock</span>}
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => enterEditMode(m)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
