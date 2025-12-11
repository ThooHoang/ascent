export function StatCard({ value, label }) {
  return (
    <div className="stat-pill">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  )
}
