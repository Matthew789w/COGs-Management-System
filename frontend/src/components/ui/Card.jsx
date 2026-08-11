function Card({ children, className = '', padding = true }) {
  const classes = ['card', padding ? 'card--padded' : '', className].filter(Boolean).join(' ')

  return <section className={classes}>{children}</section>
}

export default Card
