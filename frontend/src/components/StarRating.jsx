const StarRating = ({ rating = 0, interactive = false, onChange, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={interactive ? () => onChange(star) : undefined}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            fontSize: size,
            color: star <= Math.round(rating) ? '#f5a623' : 'var(--color-border)',
            lineHeight: 1,
          }}
          role={interactive ? 'button' : undefined}
          aria-label={interactive ? `Rate ${star} star${star > 1 ? 's' : ''}` : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
};

export default StarRating;
