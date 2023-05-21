import { createContext, useState, ReactNode, useContext } from "react";
import { User } from "../models/UserResponse";
import { IAuthContext, AuthData } from "../models/AuthResponse";

export const AuthContext = createContext<IAuthContext>({
  authData: {
    user: {} as User,
    isAuth: false,
  },
  changeAuthData: (authData: AuthData) => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    user: {
      email: "",
      id: "",
      isActivated: false,
    },
    isAuth: false,
  });

  const changeAuthData = (data: AuthData) => {
    setAuthData({ ...authData, ...data });
  };

  const value = {
    authData,
    changeAuthData,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
