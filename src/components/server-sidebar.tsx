import { Hash, Plus } from "lucide-react";

const serverSidebar = ({
  sidebarOpen,
  servers,
  setSelectedServer,
  selectedServer,
  setSidebarOpen,
}) => {
  return (
    <div
      className={`fixed top-12 md:static inset-y-0 left-0 z-20 w-16 bg-gray-900 flex flex-col items-center py-3 space-y-4 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 h-full`}
    >
      <div className="bg-indigo-600 rounded-2xl p-3 mb-4">
        <Hash className="w-6 h-6 text-white" />
      </div>

      {servers.map((server) => (
        <div
          key={server.id}
          onClick={() => {
            setSelectedServer(server.id);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 ${
            selectedServer === server.id
              ? "bg-indigo-600 rounded-2xl"
              : "bg-gray-700 hover:bg-indigo-600"
          }`}
        >
          <span className="text-xl">{server.icon}</span>
        </div>
      ))}

      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors">
        <Plus className="w-5 h-5" />
      </div>
    </div>
  );
};

export default serverSidebar;
