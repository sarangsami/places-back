const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/httpError");
const UserModel = require("../models/UserModel");

const getAllUsers = async (req, res, next) => {
  let allUsers = [];
  try {
    allUsers = await UserModel.find({},'-password');
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
  const { email, password, name,family } = req.body;
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
  const newUser = new UserModel({
    name,
    family,
    email,
    password,
    image: "test",
    places: [],
  });
  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("Register failed please try again", 500);
    return next(error);
  }
  res.status(201).json({ result: newUser.toObject({ getters: true }) });
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
  if (user && user.password !== password) {
    return next(new HttpError("Password is Wrong", 401));
  }
  res.status(200).json({ user });
};

exports.getAllUsers = getAllUsers;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
