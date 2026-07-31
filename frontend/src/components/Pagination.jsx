const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`btn btn-small ${p === page ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => onPageChange(p)}
          disabled={p === page}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-small"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
