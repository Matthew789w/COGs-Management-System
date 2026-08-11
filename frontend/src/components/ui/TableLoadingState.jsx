function TableLoadingState({
  colSpan = 6,
  rows = 5,
  message = 'Loading data…',
}) {
  return (
    <>
      <tr className="table-loading__message-row">
        <td colSpan={colSpan}>
          <div className="table-loading__header" role="status" aria-live="polite">
            <span className="table-loading__spinner" aria-hidden="true" />
            <span className="table-loading__text">{message}</span>
          </div>
        </td>
      </tr>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex} className="table-loading__row" aria-hidden="true">
          {Array.from({ length: colSpan }, (_, colIndex) => (
            <td key={colIndex}>
              <div
                className="table-loading__cell"
                style={{
                  width:
                    colIndex === colSpan - 1
                      ? '55%'
                      : `${48 + ((rowIndex + colIndex) % 4) * 10}%`,
                  marginLeft: colIndex > 0 && colIndex === colSpan - 1 ? 'auto' : undefined,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default TableLoadingState
