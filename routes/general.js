const express = require("express");
const router = express.Router();
const Token = require("../helpers/Tokens");
const User = require("../models/User");
const Company = require("../models/Company");

router.post("/login", async (req, res) => {
  try {
    if (req.body.num == "1") {
      const user = await User.login(req.body.email, req.body.password);
      res.json(user);
    } else if (req.body.num == "2") {
      const company = await Company.login(req.body.email, req.body.password);
      res.json(company);
    } else {
      throw new Error("who are you hh !!");
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

// Create a new user
router.post("/register", async (req, res) => {
  try {
    if (req.body.num == "1") {
      const user = await User.register(req.body);
      const save = await user.save();
      res.json(save);
    } else if (req.body.num == "2") {
      const company = await Company.register(req.body);
      const save = await company.save();
      res.json(save);
    } else {
      throw new Error("Wrong email or password");
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});
// Get product Details

router.post("/getproduct", async (req, res) => {
  try {
    const company = await Company.findById({
      _id: req.body.companyid,
    });
    product = {};
    company.products.forEach((element, index) => {
      if (element.id.toString() == req.body.productid.toString()) {
        product = element;
      }
    });
    res.json(product);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

router.post("/alllogin", async (req, res) => {
  try {
    const usertest = await User.findOne({ email: req.body.email });
    const companytest = await Company.findOne({ email: req.body.email });
    if (usertest) {
      var user = await User.login(req.body.email, req.body.password);
      user = JSON.parse(JSON.stringify(user));
      user.num = 1;
      res.json(user);
    } else if (companytest) {
      var company = await Company.login(req.body.email, req.body.password);
      company = JSON.parse(JSON.stringify(company));
      company.num = 2;
      res.json(company);
    } else {
      throw new Error("Wrong Email or Password");
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
