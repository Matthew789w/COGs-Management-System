function KpiCard({ label, value, meta, icon: Icon, iconColor = 'blue' }) {
  return (
    <article className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
        {Icon && (
          <div className={`kpi-card__icon kpi-card__icon--${iconColor}`}>
            <Icon size={18} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__meta">{meta}</div>
    </article>
  )
}

export default KpiCard
