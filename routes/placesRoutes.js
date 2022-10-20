const express = require("express");
const { check } = require("express-validator");
const {
  getPlaceById,
  getPlaceByUserId,
  postNewPlace,
  patchPlaceById,
  deletePlaceById,
} = require("../controllers/placesController");

const router = express.Router();

router.get("/:placeId", getPlaceById);

router.get("/user/:userId", getPlaceByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("image").not().isEmpty(),
    check("address").not().isEmpty(),
  ],
  postNewPlace
);

router.patch(
  "/:placeId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  patchPlaceById
);

router.delete("/:placeId", deletePlaceById);

module.exports = router;
