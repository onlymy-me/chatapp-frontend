import { useAuth } from "../functions";

const loginPage = () => {
  const { loginForm, setLoginForm, login } = useAuth();
  return (
    <div className="space-y-4">
      <input
        placeholder="Username"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300"
        value={loginForm.username}
        onChange={(e) =>
          setLoginForm({ ...loginForm, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300"
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
  );
};

export default loginPage;
