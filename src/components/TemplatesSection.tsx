export const TemplatesSection = () => {
  const templates = [
    {
      title: "Birthday Wishes",
      description: "Send heartfelt birthday messages",
      icon: "🎂"
    },
    {
      title: "Good Morning",
      description: "Start their day with your voice",
      icon: "🌅"
    },
    {
      title: "Love Notes", 
      description: "Express your feelings beautifully",
      icon: "💕"
    },
    {
      title: "Thank You",
      description: "Show appreciation in your voice",
      icon: "🙏"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Popular templates
        </h3>
        <p className="text-gray-600">
          Get started with these popular voice message templates
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {templates.map((template, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
          >
            <div className="text-3xl mb-3">{template.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2">
              {template.title}
            </h4>
            <p className="text-sm text-gray-600">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};