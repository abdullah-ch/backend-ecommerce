require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const users = require("./routers/users");
const category = require("./routers/category");
const products = require("./routers/product");
const uploadImages = require("./routers/upload");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// connecting to MongoDB
const mongoURL = process.env.MONGO_URL;

mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("DataBase has been connected !"))
  .catch((err) => console.log("Cannot connect to database", err.message));

// routes
app.use("/users", users);
app.use("/category", category);
app.use("/images", uploadImages);
app.use("/products", products);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`I am listening at ${port}`);
});
