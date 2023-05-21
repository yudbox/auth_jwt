const userService = require("../service/user-service");
const { validationResult } = require("express-validator");
const ApiError = require("../exceptions/api-error");
class UserController {
  async registration(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // прокидываем ошибку в next если миддлвар валидации в контроллере наел ошибки
        // "message": "Ошибка валидации",
        // "errors": [
        //     {
        //         "type": "field",
        //         "value": "reklamagul",
        //         "msg": "Invalid value",
        //         "path": "email",
        //         "location": "body"
        //     },
        //     {
        //         "type": "field",
        //         "value": 12,
        //         "msg": "Invalid value",
        //         "path": "password",
        //         "location": "body"
        //     }
        return next(ApiError.BadRequest("Ошибка валидации", errors.array()));
      }
      const { email, password } = req.body;
      const userData = await userService.registartion(email, password);

      //   refreshToken храним в кукуах
      //   maxAge равен 30 дням как и срок жизни самого токена
      //   httpOnly флаг не позволяет менят токен с фронта,
      //   только этот будет действительным который прийшел с сервера
      //   для того чтоб куки работали подключаем мидлвар cookieParser перед стартом приложения
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (error) {
      console.log("registration error", error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie("refreshToken");
      // можно вернуть 200 статус но для нагладности вернем токен
      res.json(token);
    } catch (error) {
      next(error);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.log("ACTIVATE ERROR", error);
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);

      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
