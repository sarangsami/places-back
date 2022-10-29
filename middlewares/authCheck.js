const jwt = require("jsonwebtoken");

const HttpError = require("../models/httpError");
const { JWT_KEY } = require("../utils/utils");

const authCheck = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
    if (!token) {
      throw new HttpError("Authentication failed", 401);
    }
  } catch (err) {
    return next(new HttpError("Authentication failed", 401));
  }
};

module.exports = authCheck;
