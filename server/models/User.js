const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["user", "host", "admin"], // ⬅️ add "admin" here
    default: "user"
  }
});

module.exports = mongoose.model("User", UserSchema);
