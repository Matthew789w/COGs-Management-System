function PanelHeader({ title, action, className = '' }) {
  return (
    <div className={`panel-header ${className}`.trim()}>
      <h2 className="panel-header__title">{title}</h2>
      {action && <div className="panel-header__action">{action}</div>}
    </div>
  )
}

export default PanelHeader
