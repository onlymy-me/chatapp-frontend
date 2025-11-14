import { LogIn } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import MobileHeader from "./components/mobile-header";
import ServerSidebar from "./components/server-sidebar";
import ChatHeader from "./components/chat-header";
import MessageArea from "./components/message-area";
import MessageInput from "./components/message-input";
import MembersSidebar from "./components/members-sidebar";
import ChannelsSidebar from "./components/channels-sidebar";

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
  const [isRegister, setIsRegister] = useState<boolean>(false);

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
      } else if (data.type === "online_users") {
        setOnlineUsers(data.users);
      } else if (data.type === "typing") {
        setTypingUsers(data.users.filter((u: string) => u !== user?.username));
      } else if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "join") {
        setMessages((prev) => [
          ...prev,
          { username: "System", content: `${data.username} joined` },
        ]);
      } else if (data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          { username: "System", content: `${data.username} left` },
        ]);
      }
    };

    return () => socket.close();
  }, [token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws) return;
    ws.send(
      JSON.stringify({
        type: "message",
        content: newMessage,
      })
    );
    setNewMessage("");
  };

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

  useEffect(() => {
    if (!ws || !user) return;
    const timer = setTimeout(() => {
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }, 1000);
    if (newMessage) {
      ws.send(JSON.stringify({ type: "typing", is_typing: true }));
    }
    return () => clearTimeout(timer);
  }, [newMessage]);

  const login = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        new URLSearchParams(loginForm),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const newToken = res.data.access_token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser({ username: loginForm.username });
    } catch (err) {
      alert("Login failed");
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, registerForm);
      alert("Registered! Now login.");
      setIsRegister(false);
    } catch (err) {
      alert("Register failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setMessages([]);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-kenya rounded-full flex items-center justify-center">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isRegister ? "Join" : "Welcome"}
            </h1>
          </div>

          {isRegister ? (
            <div className="space-y-4">
              <input
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-kenya"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-kenya"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
              />
              <button
                onClick={register}
                className="w-full bg-blue-400 text-white py-3 rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-kenya"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-kenya"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
              />
              <button
                onClick={login}
                className="w-full bg-blue-400 text-white py-3 rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                Login
              </button>
            </div>
          )}

          <p className="text-center mt-6 text-gray-600">
            {isRegister ? "Have account?" : "Don't have account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-kenya font-semibold hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

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
