const { validationResult } = require("express-validator");
const fs = require("fs");
const mongoose = require("mongoose");
const HttpError = require("../models/httpError");
const PlaceModel = require("../models/PlaceModel");
const UserModel = require("../models/UserModel");

const getPlaceById = async (req, res, next) => {
  const { placeId } = req.params;
  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    // Req to mongodb
    const error = new HttpError(
      "Something went wrong, Can not Find the place",
      500
    );
    return next(error);
  }
  if (!place) {
    return next(new HttpError("Can not find the place id", 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlaceByUserId = async (req, res, next) => {
  const { userId } = req.params;
  let userPlaces = [];
  let isUserExists;
  try {
    isUserExists = await UserModel.findById(userId);
  } catch (err) {
    console.log(err);
    return next(new HttpError("This User Is Not Exists", 404));
  }
  if (isUserExists) {
    try {
      userPlaces = await UserModel.findById(userId).populate("places");
    } catch (err) {
      console.log(err);
      return next(new HttpError("Something went wrong, try again", 500));
    }
  }

  if (!userPlaces) {
    return next(new HttpError("User not found", 404));
  }
  res.json({
    userPlaces: userPlaces.places
      .reverse()
      .map((place) => place.toObject({ getters: true })),
  });
};

const postNewPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  const { title, description, coordinates, address, creator } = req.body;
  const newPlace = new PlaceModel({
    title,
    description,
    image: req.file.path,
    location: JSON.parse(coordinates),
    address,
    creator,
  });

  let user;
  try {
    user = await UserModel.findById(creator);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }
  if (!user) {
    return next(new HttpError("User Not Exists", 404));
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }
  res.status(201).json({ result: newPlace });
};

const patchPlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input passed", 422));
  }
  const { placeId } = req.params;
  const { title, description } = req.body;
  let place;
  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  res.status(200).json({ updatedPlace: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const { placeId } = req.params;
  let place;
  try {
    place = await PlaceModel.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!place) {
    return next(new HttpError("Place not found", 404));
  }
  const placeImage = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  fs.unlink(placeImage, (err) => {
    console.log(err);
  });
  res
    .status(200)
    .json({ message: `Place with name of ${place.title} has been deleted.` });
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.postNewPlace = postNewPlace;
exports.patchPlaceById = patchPlaceById;
exports.deletePlaceById = deletePlaceById;
