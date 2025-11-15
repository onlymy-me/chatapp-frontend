import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, LogIn, Users, Circle, MoreVertical } from "lucide-react";

interface Message {
  username: string;
  content: string;
}

interface User {
  username: string;
}

const API_URL = "https://chatapp-backend-a3j3.onrender.com";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
  });
  const [isRegister, setIsRegister] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        if (data.username === user?.username) {
          setInput("");
        }
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

  const sendMessage = () => {
    if (!input.trim() || !ws) return;
    ws.send(JSON.stringify({ type: "message", content: input }));
    setInput("");
  };

  useEffect(() => {
    if (!ws || !user) return;
    const timer = setTimeout(() => {
      ws.send(JSON.stringify({ type: "typing", is_typing: false }));
    }, 1000);
    if (input) {
      ws.send(JSON.stringify({ type: "typing", is_typing: true }));
    }
    return () => clearTimeout(timer);
  }, [input]);

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
    <div className=" text-slate-200 h-screen bg-gray-100 flex">
      <div
        className={`fixed md:static inset-y-0 left-0 z-20 w-64 bg-slate-900 flex flex-col px-2 py-3 space-y-4 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 h-full`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-kenya" />
            Online
          </h2>
          <button onClick={logout} className="text-gray-500 hover:text-red-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          {onlineUsers.map((u) => (
            <div
              key={u}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span className="font-medium">{u}</span>
              {u === user?.username && (
                <span className="text-xs text-gray-500">(You)</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 shadow-sm p-4">
          <h1 className="text-2xl font-bold">Friends Chat</h1>
          <p className="text-sm text-gray-600">
            Real-time • {onlineUsers.length} online
          </p>
        </div>

        <div className="flex-1 bg-slate-700 overflow-y-scroll p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.username === user?.username ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  m.username === user?.username
                    ? "bg-gray-100 text-black"
                    : m.username === "System"
                    ? "bg-gray-200 text-gray-600 text-center mx-auto"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.username !== user?.username && m.username !== "System" && (
                  <p className="text-xs font-semibold opacity-75">
                    {m.username}
                  </p>
                )}
                <p>{m.content}</p>
              </div>
            </div>
          ))}
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
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-slate-900 p-4">
          <div className="flex gap-2">
            <input
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-kenya"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-slate-700 text-white p-3 rounded-full hover:bg-green-700 transition"
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
