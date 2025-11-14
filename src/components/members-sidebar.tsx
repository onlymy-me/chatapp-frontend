import { User } from "lucide-react";
const membersSidebar = ({ membersOpen, setMembersOpen, onlineUsers }) => {
  return (
    <div
      className={`fixed md:static inset-y-0 right-0 z-20 w-60 bg-gray-800 p-4 transition-transform duration-300 ${
        membersOpen ? "translate-x-0" : "translate-x-full"
      } md:translate-x-0 h-full`}
    >
      <button
        className="md:hidden absolute top-4 right-4 z-30"
        onClick={() => setMembersOpen(false)}
      >
        <User className="w-6 h-6" />
      </button>

      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Online — {onlineUsers.filter((u) => u.status !== "offline").length}
        </h3>
        <div className="space-y-2">
          {onlineUsers
            .filter((user) => user.status !== "offline")
            .map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "idle"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
                <span className="text-sm text-gray-200 truncate">
                  {user.name}
                </span>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Offline — {onlineUsers.filter((u) => u.status === "offline").length}
        </h3>
        <div className="space-y-2">
          {onlineUsers
            .filter((user) => user.status === "offline")
            .map((user, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 cursor-pointer opacity-50"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 bg-gray-500"></div>
                </div>
                <span className="text-sm text-gray-400 truncate">
                  {user.name}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default membersSidebar;
