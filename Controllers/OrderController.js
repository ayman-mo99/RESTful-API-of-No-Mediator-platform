const Order = require("../models/Order");
const User = require("../models/User");
const Company = require("../models/Company");
const CURD = require("../helpers/CURD");
const mongoose = require("mongoose");

const create = async (req, res) => {
  try {
    var company = await Company.findOne({ _id: req.body.companyid });
    if (!company) {
      throw new Error("There is no such company");
    }
    var user = await User.findOne({ _id: req.body.userid });
    if (!user) {
      throw new Error("There is no such user");
    }

    //This varibal is for adding more informations about the product
    const arr_of_products = req.body.products;
    var totalprice = 0;

    var foundproduct = false;
    for (i = 0; i < arr_of_products.length; i++) {
      foundproduct = false;

      //we have to check that the product exists
      foundproduct = company.products.find(function (post, index) {
        if (post._id == arr_of_products[i].productid) return post;
      });
      if (!foundproduct) {
        throw new Error("There is no such a product");
      }
      //we have to check that numberofitems is coorect
      if (!arr_of_products[i].numberofitems) {
        throw new Error("You should specify the number of items you want");
      }
      if (arr_of_products[i].numberofitems <= 0) {
        throw new Error("You should specify correct number of items you want");
      }

      arr_of_products[i].productname = foundproduct.productname;
      arr_of_products[i].price = foundproduct.price;
      arr_of_products[i].bonuspercentage = foundproduct.bonuspercentage;
      arr_of_products[i].image = foundproduct.image;
      totalprice =
        totalprice + foundproduct.price * arr_of_products[i].numberofitems;
    }

    //Following part we have know if this is the first collaboration between the user and the company

    //first order to the company
    const known_user = company.users.find(function (post, index) {
      if (post.id == req.body.userid) return true;
    });
    if (!known_user) {
      company = company.toJSON();
      company["users"].push({ id: mongoose.Types.ObjectId(req.body.userid) });
      await Company.findByIdAndUpdate({ _id: req.body.companyid }, company, {
        new: true,
      });
    }
    //first order to the user
    const known_comp = user.companies.find(function (post, index) {
      if (post.id == req.body.companyid) return true;
    });
    if (!known_comp) {
      user = user.toJSON();
      user["companies"].push({
        id: mongoose.Types.ObjectId(req.body.companyid),
      });
      await User.findByIdAndUpdate({ _id: req.body.userid }, user, {
        new: true,
      });
    }

    // Here, we Write the order object to save him in the database
    const order = {
      companyid: req.body.companyid,
      companyname: company.username,
      userid: req.body.userid,
      username: user.username,
      location: user.location,
      products: arr_of_products,
      totalprice: totalprice,
    };
    const saved = await Order.create(order);
    res.json(saved);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const editOrder = async (req, res) => {
  try {
    var thisorder = await Order.findOne({ _id: req.params.id });
    var index;
    if (
      req.body.productid &&
      req.body.numberofitems &&
      thisorder.accepted == false
    ) {
      // Edit number of items of product in an order

      // 1: we have to find the product
      var productindex = thisorder.products.find(function (post, i) {
        if (post.productid.toString() == req.body.productid.toString()) {
          index = i;
          return index;
        }
      });
      // 2: update the number of items of that product
      thisorder.products[index].numberofitems = req.body.numberofitems;

      // 3: we have to compute the new totalprice
      var newtotalprice = 0;
      thisorder.products.forEach(function (item) {
        newtotalprice = newtotalprice + item.price * item.numberofitems;
      });
      thisorder.totalprice = newtotalprice;

      // 4: update theorder in th e database
      const NewOne = await Order.findByIdAndUpdate(
        { _id: req.params.id },
        thisorder,
        { new: true }
      );
      res.status(200).json(NewOne);
    } else if (req.body.accepted == true && thisorder.accepted == false) {
      //Change the state of an order
      //So we need to find the company of that order to edite his data where the order will be accepted
      var comp = await Company.findOne({ _id: thisorder.companyid });
      var enoughproducts = false;
      var index;
      var temp;

      for (i = 0; i < thisorder.products.length; i++) {
        //find product
        enoughproducts = comp.products.find(function (post, ii) {
          if (
            thisorder.products[i].productid.toString() == post._id.toString()
          ) {
            index = ii;
            temp = post;
            return post;
          }
        });

        //check that order wants items less than what is in the storage
        if (
          parseInt(thisorder.products[i].numberofitems) >
          parseInt(temp.quantity)
        ) {
          throw new Error(
            "the quantity of this product is less than you order"
          );
        } else {
          // update the quantity that the company have
          comp.products[index].quantity =
            comp.products[index].quantity - thisorder.products[i].numberofitems;
        }
      }

      // We compute the bouns since the order is accepted now
      var newbouns = 0;
      thisorder.products.forEach(function (item) {
        newbouns = newbouns + item.bonuspercentage * item.numberofitems;
      });
      CURD.updateBounse(newbouns, thisorder.userid, thisorder.companyid);
      req.body.state = "accepted";

      // Update theorder in th e database
      const NewOne = await Order.findByIdAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );

      res.status(200).json(NewOne);
    } else {
      throw new Error("no correct data");
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const DeletedOne = await Order.findByIdAndRemove({
      _id: req.params.id,
    });
    res.status(200).json(DeletedOne);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const deleteProductFromOrder = async (req, res) => {
  try {
    var order = await Order.findOne({ _id: req.params.id });

    if (!order) {
      throw new Error("no such order");
    }

    if (order.products.length == 1) {
      const DeletedOne = await Order.findByIdAndRemove({
        _id: req.params.id,
      });
      res.status(200).json(DeletedOne);
    }

    order.products = order.products.filter(function (item) {
      return item.productid.toString() !== req.body.productid.toString();
    });
    var newtotalprice = 0;
    order.products.forEach(function (item) {
      newtotalprice = newtotalprice + item.price * item.numberofitems;
    });
    order.totalprice = newtotalprice;

    const NewOne = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      order,
      { new: true }
    );
    res.status(200).json(NewOne);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

const useBonus = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
    });
    if (order.bonusused) {
      throw new Error("You used your bonus in this order");
    }
    var bonus = await CURD.getBonus(order.userid, order.companyid);
    order.bonusused = true;

    if (bonus == 0) {
    } else if (order.totalprice - bonus > 0) {
      order.totalprice = order.totalprice - bonus;
      CURD.updateBounse("-" + bonus, order.userid, order.companyid);
    } else {
      remanderbounse = bonus - order.totalprice;
      CURD.updateBounse("-" + order.totalprice, order.userid, order.companyid);
      order.totalprice = 0;
    }

    const NewOne = await Order.findByIdAndUpdate(
      { _id: req.params.id },
      order,
      { new: true }
    );

    res.status(200).json(NewOne);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

//For testing only
const allOrders = async (req, res) => {
  CURD.getAll(Order, req, res);
};

const getOrder = async (req, res) => {
  CURD.getOne(Order, req, res);
};

module.exports = {
  create,
  getOrder,
  allOrders,
  editOrder,
  deleteOrder,
  deleteProductFromOrder,
  useBonus,
};
