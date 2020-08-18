const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  checkbox: { type: Boolean, required: true },
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  registrationTime: { type: String, required: true },
  lastLoginTime: { type: String, required: true },
  status: { type: String, required: true },
});

module.exports = model("User", schema);
