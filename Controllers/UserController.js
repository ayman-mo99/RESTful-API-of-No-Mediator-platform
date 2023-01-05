const User = require("../models/User");
const Order = require("../models/Order");
const Company = require("../models/Company");
const CURD = require("../helpers/CURD");
const admin = require("firebase-admin");
const bucket = admin.storage().bucket();

const login = async (req, res) => {
  try {
    console.log(req.body.email, req.body.password);
    const user = await User.login(req.body.email, req.body.password);
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const user = await User.register(req.body);
    // create a new user
    const save = await user.save();
    res.json(save);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userid: req.params.id });
    res.json(orders);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const editUser = async (req, res) => {
  try {
    if (req.file) {
      var temp = new Date().getTime().toString();
      const blob = bucket.file(temp + req.file.originalname);
      const blobStream = blob.createWriteStream();
      blobStream.on("error", (err) => {
        next(err);
      });

      blobStream.on("finish", async () => {
        const file = bucket.file(temp + req.file.originalname);
        await file
          .getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          })
          .then(async (signedUrls) => {
            req.body.logo = signedUrls[0];
            const NewUser = await User.findByIdAndUpdate(
              { _id: req.params.id },
              req.body,
              { new: true }
            );
            res.status(200).json(NewUser);
          });
      });

      blobStream.end(req.file.buffer);
    } else {
      const NewUser = await User.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res.status(200).json(NewUser);
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getUser = async (req, res) => {
  CURD.getOne(User, req, res);
};
// this will return all companies he worked with
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id })
      .populate({
        path: "companies",
        populate: { path: "id", select: { password: 0, __v: 0, users: 0 } },
      })
      .select("companies");

    res.status(200).json(user.companies);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const allCompaniesWithMyType = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    const company = await Company.find({ type: user.type }).select(
      "-__v -users -email"
    );

    res.status(200).json(company);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const suggestedCompanies = async (req, res) => {
  try {
    const user = await User.findById({ _id: req.params.id });
    const allcompanies = await Company.find({ type: user.type }).select(
      "-__v -users -password"
    );
    usercompanies = user.companies;

    finalResult = [];
    var temp = null;
    for (i = 0; i < allcompanies.length; i++) {
      temp = usercompanies.find(
        (o) => o.id.toString() == allcompanies[i]._id.toString()
      );
      if (!temp) {
        finalResult.push(allcompanies[i]);
      }
      temp = null;
    }
    res.status(200).json(finalResult);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getUserNews = async (req, res) => {
  try {
    const news = [];
    const user = await User.findById({ _id: req.params.id })
      .populate({
        path: "companies",
        populate: { path: "id", select: { password: 0, __v: 0, users: 0 } },
      })
      .select("companies");
    var temp;
    user.companies.forEach((element, index) => {
      element.id.news.forEach((element2, index) => {
        temp = JSON.parse(JSON.stringify(element2));
        temp.companyname = element.id.username;
        temp.companyid = element.id._id;
        temp.logo = element.id.logo;
        news.push(temp);
      });
    });
    var sortedNewsWithData = news.sort((a, b) => (a.date < b.date ? 1 : -1));
    res.status(200).json(sortedNewsWithData);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getUserBonus = async (req, res) => {
  try {
    var bonus = await CURD.getBonus(req.params.id, req.body.companyid);
    res.status(200).json({ bonus });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};
// for testing only
const allUsers = async (req, res) => {
  CURD.getAll(User, req, res);
};
module.exports = {
  login,
  register,
  editUser,
  allUsers,
  getUser,
  myOrders,
  getUserDetails,
  allCompaniesWithMyType,
  suggestedCompanies,
  getUserNews,
  getUserBonus,
};
