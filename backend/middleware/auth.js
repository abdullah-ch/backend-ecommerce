const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.header("Authorization");

    if (!token) return res.status(400).json({ msg: "No Token Provided" });

    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
      if (error) return res.status(400).json({ msg: "Invalid Token" });

      console.log({ decoded });
      req.user = decoded;
      console.log(req.user);
      next();
    });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
};
