import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { apiRequest } from "../api";

ChartJS.register(ArcElement, Tooltip, Legend);

const RANGES = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
];

export default function Reports() {
  const [range, setRange] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(range); }, [range]);

  async function loadReport(r) {
    setLoading(true);
    try {
      const result = await apiRequest(`/reports/${r}`);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const chartData = {
    labels: ["Taken", "Missed"],
    datasets: [
      {
        data: [data?.taken || 0, data?.missed || 0],
        backgroundColor: ["#2F6F5E", "#C24B4B"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Reports</h1>
          <p>Adherence over time.</p>
        </div>
        <select style={{ width: "auto" }} value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Total Doses</div>
          <div className="stat-value">{loading ? "–" : data?.total ?? 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Taken</div>
          <div className="stat-value">{loading ? "–" : data?.taken ?? 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Missed</div>
          <div className="stat-value">{loading ? "–" : data?.missed ?? 0}</div>
        </div>
      </div>

      <div className="card">
        <h2>Adherence Breakdown</h2>
        {!loading && data?.total === 0 ? (
          <p className="empty-state">No dispense history yet for this period.</p>
        ) : (
          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <Doughnut data={chartData} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        )}
      </div>
    </>
  );
}
