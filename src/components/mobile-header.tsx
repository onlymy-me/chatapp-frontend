import { Menu, Hash, User } from "lucide-react";
const mobileHeader = ({
  setSidebarOpen,
  sidebarOpen,
  channels,
  selectedChannel,
  setMembersOpen,
  membersOpen,
}) => {
  return (
    <div className="md:hidden h-12 bg-gray-800 w-full fixed top-0 flex items-center px-4 border-b border-gray-700 z-30">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-3">
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center">
        <Hash className="w-5 h-5 text-gray-400 mr-2" />
        <span className="font-semibold">{channels[selectedChannel]?.name}</span>
      </div>
      <button onClick={() => setMembersOpen(!membersOpen)} className="ml-auto">
        <User className="w-6 h-6" />
      </button>
    </div>
  );
};

export default mobileHeader;
