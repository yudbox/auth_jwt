import { AxiosResponse } from "axios";
import $api from "../http";
import { User } from "../models/UserResponse";

export default class UserService {
  static async getUsers(): Promise<AxiosResponse<User[]>> {
    return $api.get<User[]>("/users");
  }
}
