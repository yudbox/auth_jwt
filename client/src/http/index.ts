import axios from "axios";
import { AuthResponse } from "../models/AuthResponse";

export const API_URL = "http://localhost:5000/api";

const $api = axios.create({
  withCredentials: true, // чтоб к каждому запросу куки цеплялись автоматически
  baseURL: API_URL,
});

// interceptors это функции которые перехватывают запрос перед отправкой (request)
// и модифицирую его. В нашем случае добавляют Authorization в хедер
// или

$api.interceptors.request.use((response) => {
  response.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return response;
});

// интресептор который перехватывает ответ
$api.interceptors.response.use(
  (response) => response, // удачшый ответ просто прокидываем дальше
  async (error) => {
    // содержить данные первоночального запроса включая куки в хедере
    const originalRequest = error?.config;

    if (
      error.response.status === 401 &&
      error.config &&
      !originalRequest._isRetry
    ) {
      // переменная которая добавляется в объект запроса для предотвращения зацткливания
      originalRequest._isRetry = true;

      try {
        // !!!!!!!!!!!!!!!! ВАЖНО !!!!!!!!!!!!!!!!!!!!!!1
        //  НЕ ИСПОЛЬЗОВАТЬ ИНСТАНС $api ИЗ-ЗА ТОГО ЧТО interceptors.request БУДЕТ ПЕРЕТИРАТЬ
        // originalRequest._isRetry = true; И ЗАПРОС ЗАЦИКЛИТЬСЯ !!!!!!
        // используем axios.get на прямую
        const response = await axios.get<AuthResponse>(`${API_URL}/refresh`, {
          withCredentials: true,
        });

        // усди все нормально записываем новую пару токенов в localStorage
        localStorage.setItem("token", response.data.accessToken);
        // запускаем упавший запрос еще раз для получения юзеров
        return $api.request(originalRequest);
      } catch (error) {
        // если и accessToken и refreshToken протухли упадет ошибка
        // пользователю нужно будет залогиниться еще раз
        console.log("interceptors.response", error);
      }
    }

    return Promise.reject(error);
  }
);

export default $api;
