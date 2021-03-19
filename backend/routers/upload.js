const express = require("express");
const cloudinary = require("cloudinary");
const fs = require("fs");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

router.post("/upload", (req, res) => {
  try {
    console.log("Object keys", Object.keys(req.files).length);
    if (!req.files || Object.keys(req.files).lenght === 0)
      return res.status(400).json({ msg: "No image was uploaded" });
    const { file } = req.files;

    if (file.size > 1048576) {
      removeTempFiles(file.tempFilePath);
      return res.status(400).json({ msg: "Image size is larger than 1mb " });
    }

    console.log("my file type is", file.mimetype);
    if (
      file.mimetype != "image/jpg" &&
      file.mimetype != "image/png" &&
      file.mimetype != "image/jpeg"
    ) {
      removeTempFiles(file.tempFilePath);
      return res.json({ msg: "Format not supported" });
    }

    cloudinary.v2.uploader.upload(
      file.tempFilePath,
      { folder: "test" },
      async (err, result) => {
        if (err) throw err;

        removeTempFiles(file.tempFilePath);

        return res.json({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.post("/delete", auth, authAdmin, (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id)
      return res.status(400).json({ msg: "Please Select an image" });
    cloudinary.v2.uploader.destroy(public_id, async (err, result) => {
      if (err) throw err;
      return res.json({ msg: "Image Deleted" });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

const removeTempFiles = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

module.exports = router;
