import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Send,
  LogOut,
  Users,
  Circle,
  Menu,
  X,
  MoreVertical,
} from "lucide-react"; // LogOut and MoreVertical added/changed

// The API URL is external, which is fine for this context.
const API_URL = "https://chatapp-backend-a3j3.onrender.com";

interface Message {
  username: string;
  content: string;
}

interface User {
  username: string;
}

interface Notification {
  message: string;
  type: "success" | "error";
}

// Helper component for displaying notifications
const NotificationBanner: React.FC<{ notification: Notification | null }> = ({
  notification,
}) => {
  if (!notification) return null;

  const baseClasses =
    "fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg font-semibold transition-opacity duration-300";
  const typeClasses =
    notification.type === "error"
      ? "bg-red-500 text-white"
      : "bg-green-500 text-white";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {notification.message}
    </div>
  );
};

function App() {
  // State for token and user persistence
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedUsername = localStorage.getItem("username");
    return storedUsername ? { username: storedUsername } : null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auth Forms State
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });
  const [isRegister, setIsRegister] = useState(false);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // --- Notification Management ---
  const showNotification = useCallback(
    (message: string, type: "success" | "error") => {
      setNotification({ message, type });
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // --- Scroll to Bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- WebSocket Connection & Handlers ---
  useEffect(() => {
    if (!token || !user) return; // Need both token and user object

    const socket = new WebSocket(
      `${API_URL.replace("http", "ws")}/ws?token=${token}`
    );
    setWs(socket);

    socket.onopen = () => {
      showNotification("Connected to chat!", "success");
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { username: data.username, content: data.content },
        ]);
        if (data.username === user.username) {
          // Clear input only if the message was successfully broadcasted back
          setInput("");
        }
      } else if (data.type === "online_users") {
        // Filter out the current user's entry from the typing list (if present)
        setOnlineUsers(data.users);
      } else if (data.type === "typing") {
        setTypingUsers(data.users.filter((u: string) => u !== user.username));
      } else if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "join") {
        setMessages((prev) => [
          ...prev,
          { username: "System", content: `${data.username} joined the chat` },
        ]);
      } else if (data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          { username: "System", content: `${data.username} left the chat` },
        ]);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      showNotification("Connection error. Logging out...", "error");
      logout(); // Force logout on error
    };

    return () => socket.close();
  }, [token, user, showNotification]);

  // --- Send Message ---
  const sendMessage = () => {
    // Check if WebSocket is ready (OPEN state) before sending
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ type: "message", content: input }));
  };

  // --- Typing Indicator Logic ---
  useEffect(() => {
    // Check if WebSocket is ready (OPEN state) before sending
    if (!ws || !user || ws.readyState !== WebSocket.OPEN) return;

    let timer: NodeJS.Timeout;

    if (input) {
      // Send 'typing: true' immediately
      ws.send(JSON.stringify({ type: "typing", is_typing: true }));
      // Set a timer to send 'typing: false' after 1 second of inactivity
      timer = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "typing", is_typing: false }));
        }
      }, 1000);
    } else {
      // If input is empty (e.g., cleared by sending a message), send 'typing: false'
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }

    return () => clearTimeout(timer);
  }, [input, ws, user]);

  // --- Auth Functions ---
  const login = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        new URLSearchParams(loginForm),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const newToken = res.data.access_token;
      localStorage.setItem("token", newToken);
      localStorage.setItem("username", loginForm.username); // Store username for persistence
      setToken(newToken);
      setUser({ username: loginForm.username });
      showNotification("Login successful!", "success");
    } catch (err) {
      showNotification(
        "Login failed. Check your username and password.",
        "error"
      );
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, registerForm);
      showNotification(
        "Registration successful! Please log in now.",
        "success"
      );
      setIsRegister(false);
    } catch (err: any) {
      // Check if the error response has a specific message (e.g., user already exists)
      const errorMsg = err.response?.data?.detail || "Registration failed.";
      showNotification(errorMsg, "error");
    }
  };

  const logout = () => {
    // Gracefully close WebSocket if open
    if (ws) {
      ws.close();
      setWs(null);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUser(null);
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setSidebarOpen(false);
    showNotification("You have been logged out.", "success");
  };

  // --- Auth Screen Render ---
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <NotificationBanner notification={notification} />
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
            {isRegister ? "Join the Community" : "Welcome Back"}
          </h2>

          {isRegister ? (
            <div className="space-y-4">
              <input
                placeholder="Username (4+ chars)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && register()}
              />
              <input
                type="password"
                placeholder="Password (4+ chars)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, password: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && register()}
              />
              <button
                onClick={register}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition font-semibold shadow-md active:scale-[0.99]"
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                placeholder="Username"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              <button
                onClick={login}
                className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition font-semibold shadow-md active:scale-[0.99]"
              >
                Login
              </button>
            </div>
          )}

          <p className="text-center mt-6 text-gray-600">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-500 font-semibold hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // --- Main Chat Render ---
  return (
    <div className="flex h-screen antialiased bg-gray-200 text-gray-800">
      <NotificationBanner notification={notification} />

      {/* --- Sidebar (Online Users) --- */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white shadow-xl flex flex-col p-4 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } h-full border-r border-gray-300`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5" /> Online ({onlineUsers.length})
          </h2>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {onlineUsers.map((u) => (
            <div
              key={u}
              className={`flex items-center p-2 rounded-lg transition ${
                u === user?.username
                  ? "bg-blue-100 font-semibold"
                  : "hover:bg-gray-100"
              }`}
            >
              <Circle
                className={`w-3 h-3 mr-2 ${
                  u === user?.username ? "text-green-500" : "text-gray-400"
                } fill-current`}
              />
              <span className="truncate">{u}</span>
              {u === user?.username && (
                <span className="ml-auto text-xs text-blue-500 opacity-80">
                  (You)
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={logout}
          className="mt-4 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition font-semibold shadow-md active:scale-[0.99]"
        >
          <LogOut className="w-5 h-5" /> {/* Updated to use LogOut icon */}
          Logout
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- Main Chat Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* --- Header --- */}
        <div className="bg-white shadow-md p-4 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600 hover:text-gray-800 p-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Global Chat</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.username}
            </span>
            <Users
              className="w-5 h-5 text-blue-500 cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            />
            <button
              onClick={logout}
              className="p-1 rounded-full text-red-500 hover:bg-gray-100 hidden sm:block"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Messages Container --- */}
        <div className="flex-1 overflow-y-scroll p-4 space-y-3 bg-gray-100">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.username === user?.username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm transition-all duration-150 ${
                  m.username === user?.username
                    ? "bg-blue-500 text-white rounded-br-lg"
                    : m.username === "System"
                    ? "bg-gray-300 text-gray-600 text-sm italic mx-auto text-center rounded-lg"
                    : "bg-white text-gray-800 rounded-tl-lg"
                }`}
              >
                {m.username !== user?.username && m.username !== "System" && (
                  <p className="text-xs font-bold mb-1 opacity-75">
                    {m.username}
                  </p>
                )}
                <p className={m.username === "System" ? "font-medium" : ""}>
                  {m.content}
                </p>
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-gray-500 text-sm justify-start">
              <div className="flex gap-1 bg-white p-2 rounded-full shadow-inner">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="ml-1 italic">
                {typingUsers.join(", ")} is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* --- Input Area --- */}
        <div className="bg-white p-4 border-t border-gray-300 shadow-xl">
          <div className="flex gap-3">
            <input
              placeholder="Type your message here..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={!ws || ws.readyState !== WebSocket.OPEN} // Disabled when not open
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition shadow-lg disabled:opacity-50 active:scale-[0.98] transform"
              disabled={
                !input.trim() || !ws || ws.readyState !== WebSocket.OPEN
              } // Disabled when not open
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
