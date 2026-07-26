const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-box" role="alert">
    <p>⚠ {message}</p>
    {onRetry && (
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;
