const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const HttpError = require("../models/httpError");
const UserModel = require("../models/UserModel");

const getAllUsers = async (req, res, next) => {
  let allUsers = [];
  try {
    allUsers = await UserModel.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  res
    .status(200)
    .json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  const { email, password, name, family } = req.body;
  let isExists;
  try {
    isExists = await UserModel.findOne({ email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (isExists) {
    return next(new HttpError("User is Already Exists", 422));
  }

  let hashedPassword;

  try {
    hashedPassword = await bcryptjs.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Craete user failed, please try again later",
      500
    );
    return next(error);
  }

  const newUser = new UserModel({
    name,
    family,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Register failed please try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      "Better_to_have_random_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Register failed please try again", 500);
    return next(error);
  }
  let finalResponse = {
    ...newUser.toObject({ getters: true }),
    token,
  };
  delete finalResponse["password"];
  res.status(201).json({ result: finalResponse });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  const { email, password } = req.body;
  let user;
  try {
    user = await UserModel.findOne({ email });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!user) {
    return next(new HttpError("User not found", 404));
  }

  let isPasswordValid = false;
  try {
    isPasswordValid = await bcryptjs.compare(password, user.password);
  } catch (err) {
    return next(new HttpError("Please try again later", 500));
  }

  if (!isPasswordValid) {
    return next(new HttpError("Password is Wrong", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      "Better_to_have_random_key",
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Login failed please try again", 500);
    return next(error);
  }
  let finalResponse = {
    ...user.toObject({ getters: true }),
    token,
  };
  delete finalResponse["password"];

  res.status(200).json({ user: finalResponse });
};

exports.getAllUsers = getAllUsers;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
