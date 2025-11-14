import { useState, useEffect, useRef } from "react";
import MobileHeader from "./components/mobile-header";
import ServerSidebar from "./components/server-sidebar";
import ChatHeader from "./components/chat-header";
import MessageArea from "./components/message-area";
import MessageInput from "./components/message-input";
import MembersSidebar from "./components/members-sidebar";
import ChannelsSidebar from "./components/channels-sidebar";
import { json } from "stream/consumers";

interface Message {
  username: string;
  content: string;
}

interface User {
  username: string;
}

const API_URL = "https://chatapp-backend-a3j3.onrender.com";

const App = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [membersOpen, setMembersOpen] = useState<boolean>(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const servers = [
    { name: "Gaming Hub", icon: "🎮", id: 0 },
    { name: "Work Team", icon: "💼", id: 1 },
    { name: "Friends", icon: "👥", id: 2 },
  ];

  const channels = [
    { name: "general", type: "text", id: 0 },
    { name: "random", type: "text", id: 1 },
  ];

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  });

  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `${API_URL.replace("http", "ws")}/ws?token=${token}`
    );
    setWs(socket);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { username: data.username, content: data.content },
        ]);
      } else if (data.type === "typing") {
        setTypingUsers(data.users.filter((u: string) => u !== user?.username));
      } else if (data.type === "online_users") {
        setOnlineUsers(data.users)
      } else if (data.type === "history") {
        setMessages(data.messages)
      } else if (data.type === "join") {
        setMessages((prev) => [
          ...prev,
          { username: "System", content: `${data.username} joined`}
        ])
      } else if (data.type === "leave") {
        setMessages((prev => [
          .prev,
          { username: "" }
        ]))

    };
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: messages.length + 1,
      user: "You",
      content: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: "https://placehold.co/32x32/2a9d8f/white?text=Y",
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Close sidebars when resizing to large screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
        setMembersOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <MobileHeader
        setSidebarOpen={setSidebarOpen}
        sidebarOpen={sidebarOpen}
        channels={channels}
        selectedChannel={selectedChannel}
        setMembersOpen={setMembersOpen}
        membersOpen={membersOpen}
      />

      <ServerSidebar
        sidebarOpen={sidebarOpen}
        servers={servers}
        setSelectedServer={setSelectedServer}
        selectedServer={selectedServer}
        setSidebarOpen={setSidebarOpen}
      />

      <ChannelsSidebar
        sidebarOpen={sidebarOpen}
        servers={servers}
        selectedServer={selectedServer}
        setSidebarOpen={setSidebarOpen}
        channels={channels}
        setSelectedChannel={setSelectedChannel}
        selectedChannel={selectedChannel}
      />

      {(sidebarOpen || membersOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setMembersOpen(false);
          }}
        ></div>
      )}

      <div
        className={`flex-1 flex flex-col ${
          sidebarOpen ? "hidden md:flex" : "flex"
        } ${membersOpen ? "hidden md:flex" : "flex"}`}
      >
        <ChatHeader
          sidebarOpen={sidebarOpen}
          membersOpen={membersOpen}
          channels={channels}
          selectedChannel={selectedChannel}
        />

        <MessageArea messages={messages} />
        <MessageInput
          handleSendMessage={handleSendMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          channels={channels}
          selectedChannel={selectedChannel}
        />
      </div>
      <MembersSidebar
        membersOpen={membersOpen}
        setMembersOpen={setMembersOpen}
        onlineUsers={onlineUsers}
      />
    </div>
  );
};

export default App;
