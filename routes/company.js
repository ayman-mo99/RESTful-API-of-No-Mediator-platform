const express = require("express");
const router = express.Router();
const CompanyController = require("../Controllers/CompanyController");
const Token = require("../helpers/Tokens");
const Multer = require("multer");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

// Read the data of a company
router.post("/login", CompanyController.login);

// Create a new company
router.post("/register", CompanyController.register);

//get a company
router.get("/get/:id", CompanyController.getCompany);

// Update a company in the db
router.put("/edit/:id", multer.single("logo"), CompanyController.editCompany);

// Add product to a company in the db
router.post(
  "/addproduct/:id",
  multer.single("image"),
  CompanyController.addProduct
);

//get a company orders
router.get("/allorders/:id", CompanyController.myOrders);

//get nonaccepted company orders
router.get("/nonacceptedorders/:id", CompanyController.nonacceptedOrders);

//get  company details
router.get("/getdetails/:id", CompanyController.getCompanyDetails);

// Add news to a company in the db
router.put("/addnews/:id", CompanyController.addNews);

// Company add bouns to an user in the db
router.post("/addbouns/:id", CompanyController.addBouns);

// Add news to a company in the db
router.put("/updateproduct/:id", CompanyController.updateProduct);

//get all companies (( for testing ))
router.get("/", CompanyController.allCompanies);

module.exports = router;
