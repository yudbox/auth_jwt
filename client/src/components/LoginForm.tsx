import React, { FC, useState } from "react";
import AuthService from "../services/AuthService";
import { useAuth } from "../context/AuthContext";

const LoginForm: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { changeAuthData } = useAuth();

  const handleRegistration = async () => {
    if (!email || !password) {
      return;
    }
    try {
      const response = await AuthService.registration(email, password);
      console.log("registration response", response);

      localStorage.setItem("token", response.data.accessToken);
      changeAuthData({ user: response.data.user, isAuth: true });
    } catch (error) {
      console.log("registration error", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    try {
      const response = await AuthService.login(email, password);
      console.log("login response", response);
      localStorage.setItem("token", response.data.accessToken);
      changeAuthData({ user: response.data.user, isAuth: true });
    } catch (error) {
      console.log("login error", error);
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleRegistration}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default LoginForm;
