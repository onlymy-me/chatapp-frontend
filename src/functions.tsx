import { useState } from "react";
import axios from "axios";
import { API_URL } from "./utils";
import type { UserInfo, User } from "./types";

export function useAuth() {
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<UserInfo>({
    username: "",
    password: "",
  });

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(null);

  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, registerForm);
      alert("Registered! Now login.");
      setIsRegister(false);
    } catch {
      alert("Register failed");
    }
  };

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
    } catch {
      alert("Login failed");
    }
  };

  return {
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    isRegister,
    setIsRegister,
    token,
    setToken,
    user,
    setUser,
    register,
    login,
  };
}
