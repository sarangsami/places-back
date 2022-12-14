const express = require("express");
const { check } = require("express-validator");
const {
  getAllUsers,
  registerUser,
  loginUser,
} = require("../controllers/userController");
const fileUpload = require("../middlewares/fileUpload");

const router = express.Router();

router.get("/", getAllUsers);

router.post(
  "/register",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("family").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  "/login",
  [
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  loginUser
);

module.exports = router;
