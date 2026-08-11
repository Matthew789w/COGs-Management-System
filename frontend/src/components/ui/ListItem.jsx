import { ChevronRight } from 'lucide-react'

function ListItem({ icon: Icon, title, description, trailing, onClick, className = '' }) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={`list-item ${onClick ? 'list-item--interactive' : ''} ${className}`.trim()}
      onClick={onClick}
    >
      {Icon && (
        <div className="list-item__icon">
          <Icon size={18} aria-hidden="true" />
        </div>
      )}
      <div className="list-item__content">
        <div className="list-item__title">{title}</div>
        {description && <div className="list-item__description">{description}</div>}
      </div>
      {trailing && <div className="list-item__trailing">{trailing}</div>}
      {onClick && (
        <ChevronRight size={16} className="list-item__chevron" aria-hidden="true" />
      )}
    </Component>
  )
}

export default ListItem
