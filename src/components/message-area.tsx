const messageArea = ({ messages }) => {
  return (
    <div className="flex-1 bg-gray-800 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto mt-12">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-start space-x-3 mb-4 hover:bg-gray-750 p-2 rounded-lg transition-colors"
          >
            <img
              src={message.avatar}
              alt={message.user}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-white">{message.user}</span>
                <span className="text-xs text-gray-400">{message.time}</span>
              </div>
              <p className="text-gray-200 mt-1">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default messageArea;
