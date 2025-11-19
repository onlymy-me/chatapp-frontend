import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Send,
  LogOut,
  Users,
  Menu,
  X,
  MoreVertical,
  Sun,
  Moon,
  Smile,
  Bell,
  BellOff,
} from "lucide-react";
const API_URL = "https://chatapp-backend-a3j3.onrender.com";
const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🤔",
  "😎",
  "🥳",
  "😭",
  "🤯",
  "👍",
  "🙏",
  "❤️",
  "🔥",
  "🎉",
  "👋",
  "👀",
  "💯",
  "🚀",
  "🌟",
  "🤣",
  "😢",
  "😘",
  "🍕",
  "🍺",
  "⚽",
];
interface Message {
  username: string;
  content: string;
  timestamp: string;
}
interface User {
  username: string;
}
interface Notification {
  message: string;
  type: "success" | "error";
}
const AVATAR_COLORS = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
];
const getAvatarProps = (username: string) => {
  const hash = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const initial = username.charAt(0).toUpperCase();
  return { initial, color };
};
const Avatar: React.FC<{ username: string; size: "small" | "medium" }> = ({
  username,
  size,
}) => {
  const { initial, color } = getAvatarProps(username);
  const sizeClasses = size === "medium" ? "w-8 h-8 text-md" : "w-6 h-6 text-xs";
  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white shadow-sm flex-shrink-0 ${color} ${sizeClasses}`}
    >
      {initial}
    </div>
  );
};
const NotificationBanner: React.FC<{ notification: Notification | null }> = ({
  notification,
}) => {
  if (!notification) return null;
  const baseClasses =
    "fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg font-semibold transition-opacity duration-300";
  const typeClasses =
    notification.type === "error"
      ? "bg-red-600 text-white"
      : "bg-green-600 text-white";
  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {notification.message}
    </div>
  );
};
const formatTime = (isoString: string) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};
function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme as "light" | "dark";
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>(() =>
      "Notification" in window ? Notification.permission : "denied"
    );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const showNotification = useCallback(
    (message: string, type: "success" | "error") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );
  const requestNotificationPermission = useCallback(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          showNotification("Browser notifications are now enabled!", "success");
        } else if (permission === "denied") {
          showNotification(
            "Browser notifications are blocked. Check your system settings.",
            "error"
          );
        }
      });
    } else {
      showNotification("Your browser does not support notifications.", "error");
    }
    setIsMenuOpen(false);
  }, [showNotification]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    if (!token || !user) return;
    const socket = new WebSocket(
      `${API_URL.replace("http", "ws")}/ws?token=${token}`
    );
    setWs(socket);
    socket.onopen = () => {
      showNotification("Connected to chat!", "success");
    };
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const now = new Date().toISOString();
      if (data.type === "message") {
        const newMessage: Message = {
          username: data.username,
          content: data.content,
          timestamp: now,
        };
        setMessages((prev) => [...prev, newMessage]);
        if (data.username === user.username) {
          setInput("");
        }
        if (
          data.username !== user.username &&
          document.hidden &&
          notificationPermission === "granted"
        ) {
          new Notification(`New message from ${data.username}`, {
            body: data.content,
            icon: "https://placehold.co/100x100/3b82f6/ffffff?text=Chat",
            tag: "chat-message",
          });
        }
      } else if (data.type === "online_users") {
        setOnlineUsers(data.users);
      } else if (data.type === "typing") {
        setTypingUsers(data.users.filter((u: string) => u !== user.username));
      } else if (data.type === "history") {
        const historyWithTimestamps = data.messages.map((m: Message) => ({
          ...m,
          timestamp: m.timestamp || now,
        }));
        setMessages(historyWithTimestamps);
      } else if (data.type === "join") {
        setMessages((prev) => [
          ...prev,
          {
            username: "System",
            content: `${data.username} joined the chat`,
            timestamp: now,
          },
        ]);
      } else if (data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          {
            username: "System",
            content: `${data.username} left the chat`,
            timestamp: now,
          },
        ]);
      }
    };
    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      showNotification("Connection error. Logging out...", "error");
      logout();
    };
    return () => socket.close();
  }, [token, user, showNotification, notificationPermission]);
  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };
  const sendMessage = () => {
    if (!input.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "message", content: input }));
    setIsPickerOpen(false);
  };
  useEffect(() => {
    if (!ws || !user || ws.readyState !== WebSocket.OPEN) return;
    let timer: NodeJS.Timeout;
    if (input) {
      ws.send(JSON.stringify({ type: "typing", is_typing: true }));
      timer = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "typing", is_typing: false }));
        }
      }, 1000);
    } else {
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }
    return () => clearTimeout(timer);
  }, [input, ws, user]);
  const login = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        new URLSearchParams(loginForm),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const newToken = res.data.access_token;
      localStorage.setItem("token", newToken);
      localStorage.setItem("username", loginForm.username);
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
      const errorMsg = err.response?.data?.detail || "Registration failed.";
      showNotification(errorMsg, "error");
    }
  };
  const logout = () => {
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
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <NotificationBanner notification={notification} />
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 dark:text-gray-100 mb-8">
            {isRegister ? "Join the Community" : "Welcome Back"}
          </h2>
          {isRegister ? (
            <div className="space-y-4">
              <input
                placeholder="Username (4+ chars)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && register()}
              />
              <input
                type="password"
                placeholder="Password (4+ chars)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                onKeyPress={(e) => e.key === "Enter" && login()}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
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
  return (
    <div className="flex h-screen antialiased bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <NotificationBanner notification={notification} />
      {}
      <div
        className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col p-4 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } h-full border-r border-gray-300 dark:border-gray-700`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-5 h-5" /> Online ({onlineUsers.length})
          </h2>
          <button
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
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
              className={`flex items-center p-2 rounded-lg transition gap-3 ${
                u === user?.username
                  ? "bg-blue-100 dark:bg-blue-900 font-semibold"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Avatar username={u} size="medium" />
              <span className="truncate">{u}</span>
              {u === user?.username && (
                <span className="ml-auto text-xs text-blue-500 dark:text-blue-400 opacity-80">
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
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
      {}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      {}
      <div className="flex-1 flex flex-col min-w-0">
        {}
        <div className="bg-white dark:bg-gray-800 shadow-md p-4 flex items-center justify-between border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Global Chat
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {user?.username}
            </span>
            {}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            {}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition relative"
              aria-label="More options menu"
            >
              <MoreVertical className="w-5 h-5" />
              {}
              {notificationPermission === "denied" && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
              )}
            </button>
            {}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-700 rounded-xl shadow-2xl z-40 border border-gray-200 dark:border-gray-600 overflow-hidden">
                {}
                <button
                  onClick={requestNotificationPermission}
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  {notificationPermission === "granted" ? (
                    <BellOff className="w-4 h-4 mr-3 text-red-500" />
                  ) : (
                    <Bell className="w-4 h-4 mr-3 text-green-500" />
                  )}
                  <span className="truncate">
                    {notificationPermission === "granted"
                      ? "Disable Notifications"
                      : "Enable Notifications"}
                  </span>
                </button>
                {}
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="flex-1 overflow-y-scroll p-4 space-y-3 bg-gray-100 dark:bg-gray-900">
          {messages.map((m, i) => (
            <div
              key={`${m.username}-${m.content.substring(0, 15)}-${i}`}
              className={`flex items-start ${
                m.username === user?.username ? "justify-end" : "justify-start"
              }`}
            >
              {}
              {m.username !== user?.username && m.username !== "System" && (
                <div className="mr-2 pt-1">
                  <Avatar username={m.username} size="small" />
                </div>
              )}
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl shadow-sm transition-all duration-150 ${
                  m.username === user?.username
                    ? "bg-blue-500 text-white rounded-br-lg"
                    : m.username === "System"
                    ? "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm italic mx-auto text-center rounded-lg"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-lg"
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
                {}
                {m.timestamp && (
                  <span
                    className={`block text-right mt-1 text-xs opacity-70 ${
                      m.username === user?.username
                        ? "text-blue-200"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                  </span>
                )}
                {}
              </div>
            </div>
          ))}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm justify-start">
              <div className="flex gap-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-inner">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-300"></div>
              </div>
              <span className="ml-1 italic">
                {typingUsers.join(", ")} is typing...
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-300 dark:border-gray-700 shadow-xl relative">
          {}
          {isPickerOpen && (
            <div className="absolute bottom-full left-0 right-0 md:left-auto md:right-16 mb-2 md:w-80 w-full p-3 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 transition-all transform origin-bottom z-30">
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    className="text-2xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition transform active:scale-90"
                    onClick={() => handleEmojiSelect(emoji)}
                    aria-label={`Select emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            {}
            <div className="relative flex-1">
              <input
                placeholder="Type your message here..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 pr-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!ws || ws.readyState !== WebSocket.OPEN}
              />
              {}
              <button
                onClick={() => setIsPickerOpen((prev) => !prev)}
                className={`absolute right-0 top-1/2 transform -translate-y-1/2 mr-2 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition ${
                  isPickerOpen ? "bg-gray-200 dark:bg-gray-600" : ""
                }`}
                aria-label="Toggle emoji picker"
                disabled={!ws || ws.readyState !== WebSocket.OPEN}
              >
                <Smile className="w-6 h-6" />
              </button>
            </div>
            {}
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition shadow-lg disabled:opacity-50 active:scale-[0.98] transform"
              disabled={
                !input.trim() || !ws || ws.readyState !== WebSocket.OPEN
              }
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
