function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  ...props
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...props}>
      {Icon && iconPosition === 'left' && <Icon size={16} aria-hidden="true" />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'right' && <Icon size={16} aria-hidden="true" />}
    </button>
  )
}

export default Button
