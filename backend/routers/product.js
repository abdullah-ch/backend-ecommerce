const express = require("express");
const bcrypt = require("bcrypt");
const { Product, productSchema } = require("../models/product");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");

const router = express.Router();

class Features {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    //   console.log("I am the constructor", this.queryString);
  }

  // This function is powerful
  filtering() {
    // console.log("query string is ", this.queryString);
    const queryObject = this.queryString;
    const fields = ["page", "sort", "limit"];
    fields.forEach(function (field) {
      // syntax
      //delete object.property
      //delete object["property"];
      delete queryObject[field];
      //console.log(field);
    });

    // console.log("after delete page", queryObject);
    //console.log("Thissss", this);
    let queryStr = JSON.stringify(queryObject);
    //console.log("queryStr before replacing isssssss", queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, function (match) {
      // console.log("Match issss", match);
      // $gte $gt $lte $lte are all used in .find method
      return "$" + match;
    });

    //console.log("queryStr after replacing isssssss", queryStr);
    this.query.find(JSON.parse(queryStr));

    //  console.log("returning query", this.query);
    return this;
  }

  sorting() {
    console.log("query string is ", this.queryString);
    if (this.queryString.sort) {
      const queryStringSort = this.queryString.sort.split(",").join(" ");
      console.log("splitting", queryStringSort);

      this.query.sort(queryStringSort);
      //console.log(this.queryString.sort);
    } else {
      this.query.sort("-createdAt");
    }

    //  console.log("this in sorting", this);
    return this;
  }

  pagination() {
    // console.log("query string is ", this.queryString);

    let limit = this.queryString.limit;
    let page = this.queryString.page;
    limit = limit * 1 || 2;
    page = page * 1 || 1;
    const skip = (page - 1) * limit;
    console.log("Skip number", skip);
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

router.get("/", async (req, res) => {
  try {
    console.log("I am in the get route", req.query);
    const features = new Features(Product.find(), req.query)
      .sorting()
      .pagination()
      .filtering();
    const products = await features.query;
    return res.json({
      totalResults: products.length,
      message: "success",
      products: products,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let product = await Product.deleteOne({ _id: req.params.id });
    if (!product) return res.status(404).json({ msg: "ID not found" });
    return res.json({ msg: "Deleted the product" });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const {
      productId,
      title,
      price,
      description,
      content,
      images,
      category,
    } = req.body;

    if (!images) return res.status(404).json({ msg: "No image uploaded" });

    let product = await Product.findOne({ productId });
    if (product) return res.status(404).json({ msg: "Product already exists" });

    product = new Product({
      productId,
      title: title.toLowerCase(),
      price,
      description,
      content,
      images,
      category,
    });

    await product.save();
    res.json({ msg: "created new product" });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { title, price, description, content, images, category } = req.body;
    let product = await Product.findOne({ _id: req.params.id });
    if (!product) return res.status(404).json({ msg: "ID not found" });

    product.set({
      title: title.toLowerCase(),
      price: price,
      description: description,
      content: content,
      images: images,
      category: category,
    });

    await product.save();
    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
