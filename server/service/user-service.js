const bcrypt = require("bcrypt");
const uuid = require("uuid");
const User = require("../models/user");
const mailService = require("./mail-service");
const tokenService = require("./token-service");
const UserDto = require("../dto/user.dto");
const ApiError = require("../exceptions/api-error");

class UserService {
  async registartion(email, password) {
    // проверяем иникальность нового юзера
    const candidate = await User.findOne({ email });

    if (candidate) {
      // если есть бросаем ошибку
      throw ApiError.BadRequest(
        `Пользоваткль с таким емаил ${email} уже сужествует`
      );
    }

    const salt = 3;
    // затем хешируем пароль
    const hashPassword = await bcrypt.hash(password, salt);
    // и делаем ссылку для активации
    const activationLink = uuid.v4();
    // создаем пользователя
    const user = await User.create({
      email,
      password: hashPassword,
      activationLink,
    });
    const fullActivationLink = `${process.env.API_URL}/api/activate/${activationLink}`;
    // отправляем пользователю письмо для активации
    // await mailService.sendActivationMail(email, fullActivationLink);

    const userDto = new UserDto(user); // id, email, isActivated
    // генерируем токены
    const tokens = tokenService.generateTokens({ ...userDto });
    // сохраняем refreshToken в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink) {
    const user = await User.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest("Некорректная ссылка активации");
    }

    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest("Пользователь с таким email не найден");
    }

    const isPassEquals = await bcrypt.compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest("Неверный пароль");
    }

    const userDto = new UserDto(user); // id, email, isActivated

    // генерируем токены
    const tokens = tokenService.generateTokens({ ...userDto });

    // сохраняем refreshToken в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    return await tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken) {
    console.log("11111111111111 refreshToken", refreshToken);
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    // дата зашитая в токене
    // email: 'user3@gmail.com',
    // id: '6468901bf6cf13ce4063bb4a',
    // isActivated: true,
    // iat: 1684594242,
    // exp: 1687186242
    const userDataFromToken = tokenService.validateRefreshToken(refreshToken);

    // запись из БД
    const refreshTokenData = await tokenService.findToken(refreshToken);
    console.log("11111111111111 userDataFromToken1", userDataFromToken);

    if (!userDataFromToken || !refreshTokenData) {
      throw ApiError.UnauthorizedError();
    }
    const user = await User.findById(userDataFromToken.id);

    console.log("11111111111111 userDataFromToken2", userDataFromToken);
    console.log("11111111111111 userDataFromToken.id", userDataFromToken.id);
    console.log("11111111111111 user", user);
    const userDto = new UserDto(user); // id, email, isActivated

    // генерируем новую пару токенов
    const tokens = tokenService.generateTokens({ ...userDto });

    // сохраняем refreshToken в БД
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async getAllUsers() {
    return await User.find();
  }
}

module.exports = new UserService();
