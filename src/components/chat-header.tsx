import { Search, Phone, Video, MoreVertical, Hash } from "lucide-react";
const chatHeader = ({
  sidebarOpen,
  membersOpen,
  channels,
  selectedChannel,
}) => {
  return (
    <div
      className={`${
        sidebarOpen || membersOpen ? "hidden" : "hidden md:flex"
      } h-12 bg-gray-700 px-4 flex items-center justify-between border-b border-gray-600`}
    >
      <div className="flex items-center">
        <Hash className="w-5 h-5 text-gray-400 mr-2" />
        <span className="font-semibold">{channels[selectedChannel]?.name}</span>
      </div>
      <div className="flex items-center space-x-4">
        <Search className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        <Phone className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        <Video className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
      </div>
    </div>
  );
};

export default chatHeader;
