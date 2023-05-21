const jwt = require("jsonwebtoken");
const Token = require("../models/token");

const secretJwtAccessString = process.env.JWT_ACCESS_SECRET;
const secretJwtRefreshString = process.env.JWT_REFRESH_SECRET;

class TokenService {
  generateTokens(payload) {
    // генерируем jwt token со сроком действия 30 минут

    const accessToken = jwt.sign(payload, secretJwtAccessString, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = jwt.sign(payload, secretJwtRefreshString, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      // функция verify проверит токен на "тухлость" по времени (для аксес 30 мин)
      return jwt.verify(token, secretJwtAccessString);
    } catch (error) {
      return null;
    }
  }

  validateRefreshToken(token) {
    console.log("22222222222 secretJwtRefreshString", secretJwtRefreshString);
    console.log("2222222222 token", token);
    try {
      // функция verify проверит токен на "тухлость" по времени (для рефреш 30 дней)
      return jwt.verify(token, secretJwtRefreshString);
    } catch (error) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await Token.findOne({ user: userId });

    // данный подход не очень удачный потому что позволяет регистрировать только одну сессию
    // если юзер захочет залогинится с нового устройства то старый токен перезатрется и юзера
    // выкинит с первого устройства
    //  при сохранениии нескольких токенов необходимо продумать механизм удаления протухших токенов

    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    // если tokenData не найдена то значит юзер логиниться первый раз
    //    и звписи в БД с его id нет
    const token = await Token.create({ user: userId, refreshToken });

    return token;
  }

  async removeToken(refreshToken) {
    return await Token.deleteOne({ refreshToken });
  }

  async findToken(refreshToken) {
    return await Token.findOne({ refreshToken });
  }
}

module.exports = new TokenService();
