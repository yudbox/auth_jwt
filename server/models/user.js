const { Schema, model } = require("mongoose");

const UserShema = new Schema({
  email: { type: String, qunique: true, require: true },
  password: { type: String, require: true },
  // TODO выбрать маилер вместо гугловского и изменить isActivated на false
  isActivated: { type: Boolean, default: true },
  activationLink: { type: String },
});

module.exports = model("User", UserShema);
