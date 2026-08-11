function TablePagination({ total = 0, page = 1, pageSize = 10, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="table-pagination">
      <span className="table-pagination__info">
        Showing {start}–{end} of {total}
      </span>
      <div className="table-pagination__controls">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          Previous
        </button>
        <span className="table-pagination__page">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default TablePagination
