const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const role = (expectedRole) => (req, res, next) => {
  if (req.user.role !== expectedRole) {
    return res.status(403).json({ error: "Forbidden: Role mismatch" });
  }
  next();
};

module.exports = { auth, role };
