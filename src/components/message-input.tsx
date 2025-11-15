import { MessageSquare } from "lucide-react";

const messageInput = ({
  handleSendMessage,
  newMessage,
  setNewMessage,
  channels,
  selectedChannel,
  typingUsers,
  messagesEndRef,
}) => {
  return (
    <div className="bg-gray-700 p-4">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-3"
      >
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
            {typingUsers.join(", ")} typing...
          </div>
        )}
        <div ref={messagesEndRef}></div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channels[selectedChannel]?.name}`}
            className="w-full bg-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default messageInput;
