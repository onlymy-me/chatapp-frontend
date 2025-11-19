import { useAuth } from "../functions";

const registerPage = () => {
  const { registerForm, setRegisterForm, register } = useAuth();
  return (
    <div className="space-y-4">
      <input
        placeholder="Username"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 dark:text-white"
        value={registerForm.username}
        onChange={(e) =>
          setRegisterForm({ ...registerForm, username: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 dark:text-white"
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
  );
};

export default registerPage;
