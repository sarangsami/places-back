const jwt = require("jsonwebtoken");

const HttpError = require("../models/httpError");

const authCheck = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "Better_to_have_random_key");
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
