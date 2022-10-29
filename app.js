const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const placesRoutes = require("./routes/placesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const HttpError = require("./models/httpError");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
//access to uploads folder
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//not specified routes
app.use(() => {
  const error = new HttpError("Route not found", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An Unknown error Occurred " });
});

mongoose
  // .connect("mongodb://localhost:27017/Places")
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fmmxuub.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    console.log(err);
  });
