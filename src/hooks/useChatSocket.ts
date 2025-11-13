import { useState, useEffect } from 'react';

interface Message {
  username: string;
  content: string;
}

interface User {
  username: string;
}

const API_URL = "https://chatapp-backend-a3j3.onrender.com";

export const useChatSocket = (token: string | null, user: User | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null);

  const sendMessage = (content: string) => {
    if (!content.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'message', content }));
  }

  useEffect(() => {
    if (!token) {
      setWs(null);
      return;
    }

    const socket = new WebSocket(`${API_URL.replace('http', 'ws')}/ws?token=${token}`);
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connected.');
    }

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') { 
        setMessages(prev => [...prev, { username: data.username, content: data.content },]);
      } else if (data.type === 'online_users') {
        setOnlineUsers(data.users);
      } else if (data.type === 'typing') {
        setTypingUsers(data.users.filter((u: string) => u !== user?.username));
      } else if (data.type === "history"){
        setMessages(data.messages);
      }
    }

    socket.onclose = (e) => {
      console.log("WebSocket closed.", e);

    };

    socket.onerror = (e) => {
      console.error("WebSocket Error:", e);
    };

    return () => socket.close();
  }, [token, user?.username]);

 return {
    messages,
    onlineUsers,
    typingUsers,
    ws,
    sendMessage,
    setMessages
  };
}