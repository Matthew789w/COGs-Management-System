import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Card from './Card'

function CollapsibleSection({
  title,
  description,
  action,
  defaultOpen = true,
  variant = 'card',
  className = '',
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()
  const stateClass = open ? 'collapsible-section--open' : 'collapsible-section--closed'
  const classes = ['collapsible-section', stateClass, className].filter(Boolean).join(' ')
  const plainClasses = ['collapsible-section', 'collapsible-section--plain', stateClass, className]
    .filter(Boolean)
    .join(' ')

  const header = (
    <div className="collapsible-section__header">
      <button
        type="button"
        className="collapsible-section__trigger"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className="collapsible-section__chevron" aria-hidden="true">
          <ChevronDown size={18} strokeWidth={2.25} />
        </span>
        <span className="collapsible-section__heading">
          <span className="collapsible-section__title">{title}</span>
          {description && (
            <span className="collapsible-section__description">{description}</span>
          )}
        </span>
      </button>
      {action && <div className="collapsible-section__action">{action}</div>}
    </div>
  )

  const body = (
    <div
      id={contentId}
      className={`collapsible-section__content${open ? '' : ' collapsible-section__content--collapsed'}`}
    >
      <div className="collapsible-section__content-inner">{children}</div>
    </div>
  )

  if (variant === 'plain') {
    return (
      <section className={plainClasses}>
        {header}
        {body}
      </section>
    )
  }

  return (
    <Card className={classes} padding={false}>
      {header}
      {body}
    </Card>
  )
}

export default CollapsibleSection
