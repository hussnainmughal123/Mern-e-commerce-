const Loader = ({ label = 'Loading...' }) => (
  <div className="loader-wrap" role="status" aria-live="polite">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default Loader;
