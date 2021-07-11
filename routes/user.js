const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const Token = require("../helpers/Tokens");
const Multer = require("multer");
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

// Read the data of a user
router.post("/login", UserController.login);

// Create a new user
router.post("/register", UserController.register);

// Update a user in the db
router.put("/edit/:id", multer.single("logo"), UserController.editUser);

//get a user
router.get("/get/:id", UserController.getUser);

//get a user details
router.get("/getdetails/:id", UserController.getUserDetails);

//get a all comp wih the same type
router.get("/allsametype/:id", UserController.allCompaniesWithMyType);

//get a all comp wih the same type
router.get("/suggestedcompanies/:id", UserController.suggestedCompanies);

//get a user orders
router.get("/orders/:id", UserController.myOrders);

// get news
router.get("/news/:id", UserController.getUserNews);

// get bonus
router.post("/bonus/:id", UserController.getUserBonus);

//get all users   (( for testing ))
router.get("/", UserController.allUsers);

module.exports = router;
