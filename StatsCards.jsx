const StatsCards = ({ stats }) => {
  const items = [
    { label: "Total Products", value: stats.totalProducts, icon: "📦", accent: "blue" },
    { label: "Total Categories", value: stats.totalCategories, icon: "🏷️", accent: "purple" },
    { label: "Out of Stock", value: stats.outOfStock, icon: "🚫", accent: "red" },
  ];

  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div key={item.label} className={`stat-card stat-${item.accent}`}>
          <div className="stat-icon">{item.icon}</div>
          <div>
            <p className="stat-value">{item.value}</p>
            <p className="stat-label">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
