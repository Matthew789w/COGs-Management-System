function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div className="page-header__title-group">
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  )
}

export default PageHeader
