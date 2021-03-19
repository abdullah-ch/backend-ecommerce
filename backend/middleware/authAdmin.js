const { Users } = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    let user = await Users.findOne({ _id: req.user.id });
    if (user.roles === 0)
      return res.status(400).json({ msg: "Admin resources access denied" });

    next();
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
};
