const express = require("express");
const router = express.Router();
const OrderController = require("../Controllers/OrderController");

// create an order
router.post("/create", OrderController.create);

//get an order
router.get("/get/:id", OrderController.getOrder);

//get all orders
router.get("/", OrderController.allOrders);

//edit an order
router.put("/edit/:id", OrderController.editOrder);

//Delete product from an order
router.put("/deleteproduct/:id", OrderController.deleteProductFromOrder);

//delete an order
router.delete("/delete/:id", OrderController.deleteOrder);

//Delete product from an order
router.get("/usebonus/:id", OrderController.useBonus);

module.exports = router;
