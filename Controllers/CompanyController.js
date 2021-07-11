const Company = require("../models/Company");
const Order = require("../models/Order");
const CURD = require("../helpers/CURD");
const admin = require("firebase-admin");
const bucket = admin.storage().bucket();

const login = async (req, res) => {
  try {
    const company = await Company.login(req.body.email, req.body.password);
    res.json(company);
  } catch (err) {
    console.log(err.message);
    res.status(401).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const company = await Company.register(req.body);
    // create a new company
    const save = await company.save();
    res.json(save);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const editCompany = async (req, res) => {
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
            const NewCompany = await Company.findByIdAndUpdate(
              { _id: req.params.id },
              req.body,
              { new: true }
            );
            res.status(200).json(NewCompany);
          });
      });

      blobStream.end(req.file.buffer);
    } else {
      const NewCompany = await Company.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
      res.status(200).json(NewCompany);
    }
  } catch (err) {
    console.log(err.message);
    res.status(405).json({ message: err.message });
  }
};

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ companyid: req.params.id });
    res.json(orders);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const nonacceptedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      companyid: req.params.id,
      accepted: false,
    });
    res.json(orders);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const getCompanyDetails = async (req, res) => {
  try {
    const comp = await Company.findById({ _id: req.params.id }).populate({
      path: "users",
      populate: { path: "id", select: { password: 0, __v: 0, companies: 0 } },
    });
    res.status(200).json(comp);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const comp = await Company.findById({ _id: req.params.id });
    if (req.file) {
      // Create a new blob in the bucket and upload the file data.
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
            req.body.image = signedUrls[0];
            comp.products.push(req.body);
            const NewCompany = await Company.findByIdAndUpdate(
              { _id: req.params.id },
              comp,
              { new: true }
            );
            res.status(200).json(NewCompany);
          });
      });

      blobStream.end(req.file.buffer);
    } else {
      comp.products.push(req.body);
      const NewCompany = await Company.findByIdAndUpdate(
        { _id: req.params.id },
        comp,
        { new: true }
      );
      res.status(200).json(NewCompany);
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const addNews = async (req, res) => {
  try {
    const comp = await Company.findById({ _id: req.params.id });
    comp.news.push({ new: req.body.news, range: req.body.range });
    const NewCompany = await Company.findByIdAndUpdate(
      { _id: req.params.id },
      comp,
      { new: true }
    );
    res.status(200).json(NewCompany);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const addBouns = async (req, res) => {
  try {
    await CURD.updateBounse(req.body.newbounse, req.body.userid, req.params.id);
    res.status(200).json("update Done");
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    var company = await Company.findById({ _id: req.params.id });
    company = JSON.parse(JSON.stringify(company));

    company.products.forEach((element, index) => {
      if (element._id === req.body.productid) {
        company.products[index] = req.body.newproduct;
      }
    });

    const NewCompany = await Company.findByIdAndUpdate(
      { _id: req.params.id },
      company,
      { new: true }
    );
    res.status(200).json(NewCompany);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const allCompanies = async (req, res) => {
  CURD.getAll(Company, req, res);
};

const getCompany = async (req, res) => {
  CURD.getOne(Company, req, res);
};
module.exports = {
  login,
  register,
  allCompanies,
  editCompany,
  getCompany,
  myOrders,
  getCompanyDetails,
  nonacceptedOrders,
  addProduct,
  addNews,
  addBouns,
  updateProduct,
};
