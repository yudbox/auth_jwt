import React, { useEffect, useState } from "react";

import "./App.css";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./context/AuthContext";
import AuthService from "./services/AuthService";
import { User } from "./models/UserResponse";
import UserService from "./services/UserService";

function App() {
  const { authData, changeAuthData } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const checkAuth = async () => {
    try {
      const response = await AuthService.refresh();
      console.log("checkAuth response", response);
      localStorage.setItem("token", response.data.accessToken);
      changeAuthData({ user: response.data.user, isAuth: true });
    } catch (error) {
      console.log("checkAuth error", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      localStorage.removeItem("token");
      changeAuthData({
        user: { email: "", id: "", isActivated: false },
        isAuth: false,
      });
    } catch (error) {
      console.log("logout error", error);
    }
  };

  const handleGetUsers = async () => {
    try {
      const response = await UserService.getUsers();
      console.log("getUsers response", response);

      setUsers(response.data || []);
    } catch (error) {
      console.log("handleGetUsers error", error);
    }
  };

  useEffect(() => {
    console.log("render11111111111");

    if (localStorage.getItem("token")) {
      checkAuth();
    }
  }, []);

  return (
    <div className="App">
      <h1>
        {authData.isAuth
          ? `Пользователь ${authData.user.email} авторизован`
          : "АВТОРИЗУЙТЕСЬ"}
      </h1>
      {!authData.isAuth && <LoginForm />}
      <div>
        <button onClick={handleGetUsers}>Users list</button>
        {users.map((user) => {
          return <div key={user.email}>{user.email}</div>;
        })}
      </div>
      {authData.isAuth && (
        <div style={{ marginTop: "100px" }}>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
