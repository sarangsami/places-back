const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const placesRoutes = require("./routes/placesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const HttpError = require("./models/httpError");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

//not specified routes
app.use(() => {
  const error = new HttpError("Route not found", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) return next(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An Unknown error Occurred " });
});

mongoose
  // .connect("mongodb://localhost:27017/Places")
  .connect(
    "mongodb+srv://sarang:N2AuZN2tAfuwN9ps@cluster0.fmmxuub.mongodb.net/places?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
