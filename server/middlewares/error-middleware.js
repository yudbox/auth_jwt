const ApiError = require("../exceptions/api-error");

module.exports = function (err, req, res, next) {
  console.log("global error", err);

  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: "Ошибка сервера" });
};
