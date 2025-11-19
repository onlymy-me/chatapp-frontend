import type { User, Message } from "./types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ChatStore = {
  // Auth
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Chat data
  messages: Message[];
  onlineUsers: string[];
  typingUsers: string[];

  // UI
  sidebarOpen: boolean;
  notification: { message: string; type: "success" | "error" } | null;

  // Actions
  setAuth: (token: string | null, username: string | null) => void;
  logout: () => void;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setOnlineUsers: (users: string[]) => void;
  setTypingUsers: (users: string[]) => void;
  toggleSidebar: () => void;
  showNotification: (msg: string, type: "success" | "error") => void;
  clearNotification: () => void;
};

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      token: localStorage.getItem("token"),
      user: localStorage.getItem("username")
        ? { username: localStorage.getItem("username")! }
        : null,
      isAuthenticated: !!localStorage.getItem("token"),
      messages: [],
      onlineUsers: [],
      typingUsers: [],
      sidebarOpen: false,
      notification: null,

      setAuth: (token, username) =>
        set(
          {
            token,
            user: username ? { username } : null,
            isAuthenticated: !!token,
          },
          false,
          "setAuth"
        ),

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        set(
          {
            token: null,
            user: null,
            isAuthenticated: false,
            messages: [],
            onlineUsers: [],
            typingUsers: [],
            sidebarOpen: false,
          },
          false,
          "logout"
        );
      },

      addMessage: (msg) =>
        set((state) => ({
          messages: [...state.messages, msg],
        })),

      setMessages: (msgs) => set({ messages: msgs }),
      setOnlineUsers: (users) => set({ onlineUsers: users }),
      setTypingUsers: (users) => set({ typingUsers: users }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      showNotification: (msg, type) =>
        set({
          notification: { message: msg, type },
        }),
      clearNotification: () => set({ notification: null }),
    }),
    { name: "ChatStore" }
  )
);
