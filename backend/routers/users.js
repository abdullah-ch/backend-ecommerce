const express = require("express");
const bcrypt = require("bcrypt");
const { Users, userSchema } = require("../models/user");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const router = express.Router();

// registering
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    //console.log(Users);
    //console.log(userSchema);
    let user = await Users.findOne({ email });
    if (user) return res.status(404).json({ msg: "The email already exists" });

    if (password.length < 6)
      return res.status(404).json({ msg: "The password is less than 6" });

    // Hashing password
    const newPassword = await bcrypt.hash(password, 10);

    // creating a user and saving in db
    user = await new Users({ name, email, password: newPassword });
    await user.save();

    // creating JWT token for authenticating the user
    const accessToken = createAccessToken({ id: user._id });
    const refreshToken = createRefreshToken({ id: user._id });

    let cookie = res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/users/refreshtoken",
    });

    //res.json({ accessToken });
    return res.json({ password, newPassword, user, accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

// logging in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await Users.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });
    const isUser = await bcrypt.compare(password, user.password);
    if (!isUser) return res.status(400).json({ msg: "Incorrect Password" });

    // Now if User is authentic, we'll generate access and refresh token
    const accessToken = createAccessToken({ id: user._id });
    const refreshToken = createRefreshToken({ id: user._id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/users/refreshtoken",
    });

    return res.json({ user, accessToken, refreshToken });
  } catch (error) {
    // 500 means internal service error
    return res.status(500).json({ msg: error.message });
  }
});

// logging out
router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("refreshToken", { path: "/users/refreshtoken" });
    res.json({ msg: "Logged Out" });
  } catch (error) {
    // 500 means internal service error
    return res.status(500).json({ msg: error.message });
  }
});

router.get("/refreshtoken", (req, res) => {
  try {
    const rfToken = req.cookies.refreshToken;
    console.log({ rfToken });
    if (!rfToken)
      return res.status(400).json({ msg: "Please login or sign up" });

    // verifying the token that we sent when user registered
    // the token shows ig it's the registered user or not
    jwt.verify(rfToken, process.env.REFRESH_TOKEN, (error, decoded) => {
      if (error)
        return res.status(400).json({ msg: "Please login or sign up" });
      const accessToken = createAccessToken({ id: decoded.id });
      res.json({ decoded, accessToken });
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

//Getting User info
router.get("/information", auth, async (req, res) => {
  try {
    let user = await Users.findById(req.user.id).select("-password");
    if (!user) return res.status(400).json({ msg: "User Not Found" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

const createAccessToken = (userID) => {
  return jwt.sign(userID, process.env.ACCESS_TOKEN, { expiresIn: "1d" });
};

const createRefreshToken = (userID) => {
  return jwt.sign(userID, process.env.REFRESH_TOKEN, { expiresIn: "7d" });
};

module.exports = router;
