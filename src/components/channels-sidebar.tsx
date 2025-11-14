import { Hash, Plus, Mic, User, Bell, Settings } from "lucide-react";
const channelsSidebar = ({
  sidebarOpen,
  servers,
  selectedServer,
  setSidebarOpen,
  channels,
  setSelectedChannel,
  selectedChannel,
}) => {
  return (
    <div
      className={`fixed md:static top-12 inset-y-0 left-0 pl-16 z-11 w-60 bg-gray-800 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 h-90%`}
    >
      <div className="h-12 px-4 flex items-center border-b border-gray-700 font-semibold">
        {servers[selectedServer].name}
      </div>

      <div className="p-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Text Channels
          </span>
          <Plus className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
        </div>

        {channels
          .filter((channel) => channel.type === "text")
          .map((channel) => (
            <div
              key={channel.id}
              onClick={() => {
                setSelectedChannel(channel.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-700 mb-1 ${
                selectedChannel === channel.id ? "bg-gray-700" : ""
              }`}
            >
              <Hash className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm">{channel.name}</span>
            </div>
          ))}
      </div>

      <div className="p-2">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Voice Channels
          </span>
          <Plus className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
        </div>

        {channels
          .filter((channel) => channel.type === "voice")
          .map((channel) => (
            <div
              key={channel.id}
              className="flex items-center py-1 px-2 rounded cursor-pointer hover:bg-gray-700 mb-1"
            >
              <Mic className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm">{channel.name}</span>
            </div>
          ))}

        <div className="flex items-center p-2 mt-4 bg-gray-700 rounded-lg">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
          </div>
          <div className="ml-2 flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Your Name</div>
            <div className="text-xs text-gray-400">#1234</div>
          </div>
          <div className="flex space-x-1">
            <Bell className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
            <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default channelsSidebar;
