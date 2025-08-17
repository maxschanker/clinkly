export const StatsSection = () => {
  const stats = [
    { number: "10K+", label: "Voice messages sent" },
    { number: "500+", label: "Happy users" },
    { number: "99%", label: "Delivery rate" }
  ];

  return (
    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {stat.number}
          </div>
          <div className="text-sm text-gray-600">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};