import { User } from "./UserResponse";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AuthData {
  user: User;
  isAuth: boolean;
}

export interface IAuthContext {
  authData: AuthData;
  changeAuthData: (authData: AuthData) => void;
}
