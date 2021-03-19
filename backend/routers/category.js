const express = require("express");
const bcrypt = require("bcrypt");
const { Category, categorySchema } = require("../models/category");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

const router = express.Router();
// routes

router.get("/", async (req, res) => {
  try {
    let categories = await Category.find();
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// only admin can update delete create categories
router.post("/add", auth, authAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    let category = await Category.findOne({ name });
    if (category)
      return res.status(404).json({ msg: "This category already exists" });
    category = new Category({ name });
    await category.save();
    return res.json({
      msg: `${name} category has been added into the database`,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// deleting a category

router.delete("/delete/:id", auth, authAdmin, async (req, res) => {
  try {
    let category = await Category.deleteOne({ _id: req.params.id });
    if (!category) return res.status(404).json({ msg: "ID not found" });
    return res.json({ msg: "Deleted the category" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// updating a category

router.put("/update/:id", auth, authAdmin, async (req, res) => {
  try {
    let category = await Category.findOne({ _id: req.params.id });
    if (!category) return res.status(404).json({ msg: "ID not found" });
    category.set({
      name: req.body.name,
    });

    await category.save();
    return res.json({ msg: "Updated the category" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

module.exports = router;
